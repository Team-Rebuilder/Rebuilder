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

  numImgRequests: number = 0;

  async ngOnInit(): Promise<void> {
    this.currModel$ = await this.modelsService.getModelById(this.modelId());
    this.sourcePartCount = this.currModel$.sourcePartCount;
    this.modelPartCount = this.currModel$.modelPartCount;
    this.partListUrl = this.currModel$.partsListUrls[0];
    try {
      this.partData = (await this.populatePartData());
    } catch {
      this.messageService.add({severity:'error', summary:'Error', detail: 'Error fetching part data.'});
    }
  }

  // Fetch part data from the CSV file and return as a list of Part objects
  async populatePartData(): Promise<Part[]> {
    const csvUrl = this.currModel$.partsListUrls[0];
    try {
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvData = await response.text();
      // Last 4 lines of standard Bricklink CSV file are not part data
      const partIdList = (await this.parseCsvCol(csvData, 'LdrawId')).slice(0, -4);
      const partCountsList = await this.parseCsvCol(csvData, 'Qty');
      const partColorsList = await this.parseCsvCol(csvData, 'ColorName');
      const partImgs: { [key: string]: string } = await this.getPartImages(partIdList);

      // Consolidate CSV part data into a list of Part objects
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

  // Parse a CSV column by its name and return an array of values
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

  // Fetch part images for given list of CSV-derived partIds and encode in dict
  // Written with assistance from Github Copilot
  async getPartImages(csvPartIds: string[]): Promise<{ [key: string]: string }> {
    const url = `https://rebrickable.com/api/v3/lego/parts/?part_nums=`;

    // Fetch data for all partIds in a single request from Rebrickable
    const response = await fetch(url + csvPartIds.join(','), {
      headers: {
        'Authorization': `key ${rebrickableKey}`
      }
    });
    const rebrickablePartData = await response.json();

    // Create a dictionary of partId to partImgUrl
    const imageDict: { [key: string]: string } = {};

    // For each partId in the CSV, search for the corresponding part image URL
    await Promise.all(csvPartIds.map(async csvPartId => {
      // Retrieve any entry from Rebrickable API matching the searched partId
      const partDatum = rebrickablePartData.results.find(
        (rebrickablePart: Part) => rebrickablePart.part_num === csvPartId
      );
      // If part entry found in fetched data, use its part_img_url;
      // Else attempt backup search using Bricklink ID search
      imageDict[csvPartId] = partDatum ? partDatum.part_img_url
        : await this.getBackupImg(csvPartId);
    }));

    return imageDict;
  }

  // If Rebrickable API can't find the part normally, try searching Bricklink ID
  // Returns part image URL for the given Bricklink ID
  async getBackupImg(brickLinkPartId: string): Promise<string> {
    this.numImgRequests++;
    // Hard cap on lifetime fetches to prevent IP ban for excessive requests
    if (this.numImgRequests > 10 || !brickLinkPartId) {
      return "";
    }
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
