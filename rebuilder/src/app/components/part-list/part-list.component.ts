import { Component, input, inject } from '@angular/core';
import { rebrickableKey } from '../../credentials';
import { ModelsService } from '../../services/models.service';
import * as Papa from 'papaparse';

interface Part {
  part_num: string;
  count: string;
  color: string;
  part_img_url: string;
}

interface Image {
  part_num: string;
  part_img_url: string;
}

@Component({
  selector: 'app-part-list',
  standalone: true,
  imports: [],
  templateUrl: './part-list.component.html',
  styleUrl: './part-list.component.css'
})
export class PartListComponent {

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

  // Written with assistance from AI
  async parseCsvCol(csvText: string, columnName: string): Promise<string[]> {
    const results = Papa.parse(csvText, {
      header: true,
      dynamicTyping: false
    });

    const columnData = (results.data as Record<string, string>[]).map(
      (row: Record<string, string>) => row[columnName]
    );

    return columnData;
  }

  /* Standardize given Bricklink part ID to Rebrickable ID
   */
  async standardizePartId(partId: string): Promise<string> {
    // If part ID is already numeric, it will match the API ID
    if (this.isNumeric(partId)) {
      return partId;
    }

    const url = `https://rebrickable.com/api/v3/lego/parts/?bricklink_id=`;

    // Standardize any print headers in the ID
    const stdId1 = partId.replace(/bpb/g, 'pb');

    // Remove leading zero from print headers in the ID
    const stdId2 = stdId1.replace(/(\d+)(?!.*\d)/, '0$1');

    // Make an initial fetch request to url + stdId1
    try {
      let response = await fetch(url + stdId1, {
        headers: {
            'Authorization': `key ${rebrickableKey}`
          }
      });
      let data = await response.json();
      // Try finding Rebrickable ID entry using stdId1 (with standardized header)
      try {
        const stdPartId = data.results[0].part_num;
        return stdPartId;
      } catch (error) {
        // Make a second fetch request to url + stdId2 if the first one fails
        response = await fetch(url + stdId2, {
          headers: {
            'Authorization': `key ${rebrickableKey}`
          }
        });
        data = await response.json();
        // Try finding Rebrickable ID entry using stId2 (removing leading zero)
        try {
          const stdPartId = data.results[0].part_num;
          return stdPartId;
        } catch (error) {
          const numericPortions = partId.match(/\d+/);
          return numericPortions ? numericPortions[0] : partId;
        }
      }
    } catch (error) {
      throw new Error(`Error fetching part data: ${error}`);
    }
  }

  async getPartImages(partIds: string[]): Promise<{ [key: string]: string }> {
    const url = `https://rebrickable.com/api/v3/lego/parts/?part_nums=`;
    const response = await fetch(url + partIds.join(','), {
      headers: {
        'Authorization': `key ${rebrickableKey}`
      }
    });
    const data = await response.json();

    // Really ugly AI-written code, may need to be refactored
    const imageDict: { [key: string]: string } = {};

    await Promise.all(partIds.map(async partId => {
      const part = data.results.find((part: Part) => part.part_num === partId);
      imageDict[partId] = part ? part.part_img_url : await this.getBackupImg(partId);
    }));

    return imageDict;
  }

  isNumeric(str: string): boolean {
    return /^\d+$/.test(str);
  }

  // If Rebrickable API can't find the part normally, get it using Bricklink ID
  async getBackupImg(partId: string): Promise<string> {
    const url = `https://rebrickable.com/api/v3/lego/parts/?bricklink_id=`;
    const response = await fetch(url + partId, {
      headers: {
        'Authorization': `key ${rebrickableKey}`
      }
    });
    const data = await response.json();

    return data.results[0].part_img_url;
  }
}