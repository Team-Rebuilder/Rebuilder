import { Component, input, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import * as Papa from 'papaparse';
import { rebrickableKey } from '../../credentials';
import { ModelsService } from '../../services/models.service';

// Parts color map extracted with the help of AI (ChatGPT)
// Original Source: https://www.bricklink.com/catalogColors.asp
import { colorMap } from '../../data/colorCode';

interface Part {
  part_num: string;
  count: string;
  color: string;
  part_img_url: string;
}

@Component({
  selector: 'app-part-list',
  standalone: true,
  imports: [
    ToastModule,
    SkeletonModule,
    ProgressBarModule
  ],
  templateUrl: './part-list.component.html',
  styleUrl: './part-list.component.css'
})
export class PartListComponent {
  messageService = inject(MessageService);
  modelsService = inject(ModelsService);
  currModel$: any;
  partListUrl: string = "";
  partData: Part[] = [];

  sourcePartCount: number = 0;
  modelPartCount: number = 0;

  modelId = input.required<string>();
  sourceSets: number[] = [];

  async ngOnInit(): Promise<void> {
    this.currModel$ = await this.modelsService.getModelById(this.modelId());
    this.sourcePartCount = this.currModel$.sourcePartCount;
    this.partListUrl = this.currModel$.partsListUrls[0];
    // Last 4 lines of standard Bricklink CSV file are not part data
    this.partData = (await this.populatePartData()).slice(0, -4);
    this.modelPartCount = this.partData.reduce((sum, part) => sum + parseInt(part.count), 0);
  }

  async populatePartData(): Promise<Part[]> {
    const csvUrl = this.currModel$.partsListUrls[0];
    try {
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvData = await response.text();
      const partIdList = await this.parseCsvCol(csvData, 'LdrawId');
      const partCountsList = await this.parseCsvCol(csvData, 'Qty');
      const partColorsList = await this.parseCsvCol(csvData, 'ColorName');
      const partImgs: { [key: string]: string } = await this.getPartImages(partIdList);

      const partData: Part[] = partIdList.map((ldrawId, index) => ({
        part_num: ldrawId,
        count: partCountsList[index],
        color: partColorsList[index],
        part_img_url: partImgs[ldrawId],
      }));

      return partData;
    } catch (error) {
      throw new Error(`Error fetching CSV data: ${error}`);
    }
  }

  // Written with assistance from Github Copilot
  async parseCsvCol(csvText: string, columnName: string): Promise<string[]> {
    const results = Papa.parse(csvText, {
      header: true,
      dynamicTyping: false
    });

    // Each Record from results.data is a row of the CSV with column name as key
    const columnData = (results.data as Record<string, string>[]).map(
      (row: Record<string, string>) => row[columnName]
    );

    return columnData;
  }

  async getPartImages(bricklinkPartIds: string[]): Promise<{ [key: string]: string }> {
    const url = `https://rebrickable.com/api/v3/lego/parts/?part_nums=`;

    // Fetch part images for all partIds in a single request from Rebrickable
    const response = await fetch(url + bricklinkPartIds.join(','), {
      headers: {
        'Authorization': `key ${rebrickableKey}`
      }
    });
    const rebrickablePartData = await response.json();

    const imageDict: { [key: string]: string } = {};

    await Promise.all(bricklinkPartIds.map(async bricklinkPartId => {
      // Look for Rebrickable partDatum with ID === current bricklinkPartId
      const partDatum = rebrickablePartData.results.find(
        (rebrickablePart: Part) => rebrickablePart.part_num === bricklinkPartId
      );
      // If partDatum is found, use its part_img_url, else fetch backup image
      imageDict[bricklinkPartId] = partDatum ? partDatum.part_img_url
        : await this.getBackupImg(bricklinkPartId);
    }));

    return imageDict;
  }

  // If Rebrickable API can't find the part normally, get it using Bricklink ID
  async getBackupImg(brickLinkPartId: string): Promise<string> {
    const url = `https://rebrickable.com/api/v3/lego/parts/?bricklink_id=`;
    const response = await fetch(url + brickLinkPartId, {
      headers: {
        'Authorization': `key ${rebrickableKey}`
      }
    });
    const data = await response.json();

    return data.results[0].part_img_url;
  }

  // When the user copies the message to the clipboard
  // https://www.w3schools.com/howto/howto_js_copy_clipboard.asp
  handleCopy(data: string) {
    let textToCopy = document.createElement('textarea');
    textToCopy.value = data;
    document.body.appendChild(textToCopy);

    textToCopy.select();
    textToCopy.setSelectionRange(0, 99999); // For mobile devices
    // document.execCommand("copy");
    navigator.clipboard.writeText(data);
    document.body.removeChild(textToCopy);

    let msg = "";
    // Show a toast message to the user
    if (!isNaN(Number(data))) {
      msg = `Part number: ${data} copied to clipboard`;
    } else {
      msg = `Color: ${data} copied to clipboard`;
    }
    this.messageService.add({severity:'success', summary:'Success', detail: msg});
  }

  // Get the color code for the given color name
  getColorCode(color: string): string {
    return colorMap[color];
  }
}