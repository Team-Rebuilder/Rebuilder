import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormControl as FromGroup, FormArray } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { TreeSelectModule } from 'primeng/treeselect';
import { ToastModule } from 'primeng/toast';
import { ScrollTopModule } from 'primeng/scrolltop';
import { MessageService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';
import * as Papa from 'papaparse';

import { ModelsService } from '../../services/models.service';
import { HomeComponent } from '../homenavbar/home.component';
import { rebrickableKey } from '../../credentials';

type CSVRow = string[];

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    HomeComponent,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    TreeSelectModule,
    FileUploadModule,
    ToastModule,
    ScrollTopModule,
    NgClass
  ],
  providers: [MessageService],
  // encapsulation: ViewEncapsulation.None,
  templateUrl: './submit.component.html',
  styleUrl: './submit.component.css'
})
export class SubmitComponent {
  modelsService = inject(ModelsService);
  router = inject(Router);

  SubmitForm: FormGroup;
  submissionValue: any; // Form submission value
  username: string = '';
  usernameSet: boolean = false;
  formSubmitted: boolean = false;
  isSetNumberValidCount: number = 0;
  isLoading: boolean = false;

  // Maximum file size (10 MB)
  MAX_FILE_SIZE = 10 * 1024 * 1024;

  // Uploaded Image
  uploadedImages: File[] = [];
  uploadedPDFs: File[] = [];
  uploadedCSVs: File[] = [];
  uploadedMPDs: File[] = [];

  constructor(private messageService: MessageService) {
    this.SubmitForm = new FormGroup({
      title: new FromGroup('', Validators.required),
      category: new FromGroup('', Validators.required),
      description: new FromGroup('', Validators.required),
      sourceSets: new FormArray([new FromGroup('', Validators.required)]),
      imageFile: new FromGroup('', Validators.required),
      instructionFile: new FromGroup('', Validators.required),
      partsListFile: new FromGroup('', Validators.required),
      threemodelFile: new FromGroup(''),
    });

    this.watchChanges();

    // On auth status change, update the username
    // Also, when the user logs out, username should be cleared and the form should be reset
    // Maybe change to use authGuard?
    this.modelsService.user$.subscribe((user) => {
      if (user?.displayName) {
        this.username = user.displayName;
        this.setUsername(user.displayName);
      } else {
        this.clearUsername();
      }
    });
  }

  // When the user changes the username
  onUserNameChange(userNameValue: string) {
    this.username = userNameValue;
  }

  // Set the username
  setUsername(username: string): void {
    if (!username) {
      return;
    }

    this.username = username;
    this.usernameSet = true;
  }

  // Clear the username
  clearUsername(): void {
    this.username = '';
    this.usernameSet = false;
    this.formSubmitted = false;
  }

  // Watch values that need validation
  // https://www.tektutorialshub.com/angular/valuechanges-in-angular-forms/?__cf_chl_rt_tk=ZbKGfBk3fRzboWGJnzU73Iq29Vd7Qp_HbIek14wp5Os-1730573211-1.0.1.1-VTJ0NWSL5g5_xIePdM62KXNpbCq00bPFXD4ogKAze58
  watchChanges(): void {
    this.SubmitForm.valueChanges.subscribe((value) => {
      this.submissionValue = value;
    });
  }

  createSourceGroup(): FromGroup {
    return new FromGroup('', Validators.required);
  }

  get sourceSets(): FormArray {
    return this.SubmitForm.get('sourceSets') as FormArray;
  }

  addSource(): void {
    for (const control of this.sourceSets.controls) {
      control.markAsTouched();
    }
    this.sourceSets.push(this.createSourceGroup());
  }

  removeSource(index: number): void {
    this.sourceSets.removeAt(index);
  }

  // Handle temporary file uploads
  onFilesSelected(event: any, fileType: string) {
    const files = event.target.files;

    // Check if the file exceeds the maximum file size
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > this.MAX_FILE_SIZE) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `File size exceeds the maximum file size of ${this.MAX_FILE_SIZE / 1024 / 1024} MB.`
        });
        return;
      }
    }

    if (files) {
      switch (fileType) {
        case 'image':
          // If the user upload more than 5 images, show an error message
          if (this.uploadedImages.length + files.length > 5) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'You can only upload up to 5 images.'
            });
            return;
          }

          this.uploadedImages.push(...files);
          break;
        case 'pdf':
          // If the user upload more than 1 file, show an error message
          if (this.uploadedPDFs.length + files.length > 1) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'You can only upload up to 1 PDF file.'
            });
            return;
          }

          this.uploadedPDFs.push(...files);
          break;
        case 'csv':
          // If the user upload more than 1 file, show an error message
          if (this.uploadedCSVs.length + files.length > 1) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'You can only upload up to 1 CSV file.'
            });
            return;
          }

          this.uploadedCSVs.push(...files);
          break;
        case 'mpd':
          // If the user upload more than 1 file, show an error message
          if (this.uploadedMPDs.length + files.length > 1) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'You can only upload up to 1 MPD file.'
            });
            return;
          }

          this.uploadedMPDs.push(...files);
          break;
      }
    }
  }

  // Handle file removal
  onFileRemove(file: any, fileType: string) {
    switch (fileType) {
      case 'image':
        this.uploadedImages = this.uploadedImages.filter((f) => f !== file);
        break;
      case 'pdf':
        this.uploadedPDFs = this.uploadedPDFs.filter((f) => f !== file);
        break;
      case 'csv':
        this.uploadedCSVs = this.uploadedCSVs.filter((f) => f !== file);
        break;
      case 'mpd':
        this.uploadedMPDs = this.uploadedMPDs.filter((f) => f !== file);
        break;
    }
  }

  // Handle file submission
  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) {
      return;
    }

    // Check the set number
    await this.checkSetNumber();
    if (this.isSetNumberValidCount > 0) {
      // Show an error message
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid set number(s)! Number needs to be valid before submission.' });
      return;
    }

    // Calculate source set(s') part count
    let sourcePartCount = 0;
    for (let i = 0; i < this.sourceSets.length; i++) {
      try {
        sourcePartCount += await this.getPartCount(this.sourceSets.at(i)?.value);
      } catch (error) {
        console.error(error);
      }
    }

    // Set the loading state
    this.isLoading = true;

    this.processCSV(this.uploadedCSVs[0]);

    try {
      // First, upload the files
      const imageUrls = this.uploadedImages.length ? await this.modelsService.uploadFiles(this.username, this.uploadedImages, 'image') : [];
      const pdfUrls = this.uploadedPDFs.length ? await this.modelsService.uploadFiles(this.username, this.uploadedPDFs, 'pdf') : [];
      const csvUrls = this.uploadedCSVs.length ? await this.modelsService.uploadFiles(this.username, this.uploadedCSVs, 'csv') : [];
      const mpdUrls = this.uploadedMPDs.length ? await this.modelsService.uploadFiles(this.username, this.uploadedMPDs, 'mpd') : [];

      // Then, submit the model
      const modeldata = {
        username: this.username,
        title: this.submissionValue.title,
        category: this.submissionValue.category,
        description: this.submissionValue.description,
        sourceSets: this.sourceSets.value,
        sourcePartCount: sourcePartCount,
        imageUrls: imageUrls,
        instructionUrls: pdfUrls,
        partsListUrls: csvUrls,
        threemodelUrls: mpdUrls
      };
      await this.modelsService.submitModel(modeldata);

    } catch (error) {
      console.error(error);
    }

    // Clear the form
    this.SubmitForm.reset();
    this.uploadedImages = [];
    this.uploadedPDFs = [];
    this.uploadedCSVs = [];
    this.uploadedMPDs = [];

    this.isLoading = false;

    // Show a success message
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Model submitted successfully!' });
    this.formSubmitted = true;
  }

  // Check if the form is valid
  isFormValid(): boolean {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
    return (
      (this.SubmitForm.get('title')?.valid ?? false) &&
      (this.SubmitForm.get('category')?.valid ?? false) &&
      (this.SubmitForm.get('description')?.valid ?? false) &&
      this.sourceSets.controls.every((sourceControl) => sourceControl.valid) &&
      (this.uploadedImages.length > 0) &&  // At least one image is required
      (this.uploadedPDFs.length > 0) &&    // At least one PDF is required
      (this.uploadedCSVs.length > 0)       // At least one CSV is required
    );
  }

  // Reset the form
  resetForm(): void {
    // Check if the form is empty
    if (!this.SubmitForm.dirty) {
      return;
    }

    // Before resetting the form, confirm with the user
    if (!confirm('Are you sure you want to reset the form?')) {
      return;
    }

    this.SubmitForm.reset();
    this.uploadedImages = [];
    this.uploadedPDFs = [];
    this.uploadedCSVs = [];
    this.uploadedMPDs = [];
    this.SubmitForm.setControl('sourceSets', new FormArray([new FromGroup('', Validators.required)]));

    // Show a success message
    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'Form reset successfully!' });
  }

  // Check if the set number is valid
  async isSetNumber(number: number): Promise<boolean> {
    const response = await fetch(`https://rebrickable.com/api/v3/lego/sets/${number}-1/`, {
      headers: {
        'Authorization': `key ${rebrickableKey}`
      }
    });

    if (response.status === 404) {
      return false;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  }

  // Check if the set number is valid
  async checkSetNumber(): Promise<void> {
    // First, reset the count
    this.isSetNumberValidCount = 0;

    try {
      // List of set numbers
      const setNumFrom = this.SubmitForm.get('sourceSets') as FormArray | null;

      // If the set numbers are empty, show an error message
      let isEmpty = true;
      for (let i = 0; i < setNumFrom!.length; i++) {
        if (setNumFrom!.at(i)?.value) {
          isEmpty = false;
          break;
        }
      }
      if (isEmpty) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Set number is empty!' });
        this.isSetNumberValidCount++;
        return;
      }

      // // If each of the set number is not a number, show an error message
      let isNotNumber = true;
      for (let i = 0; i < setNumFrom!.length; i++) {
        if (!isNaN(setNumFrom!.at(i)?.value)) {
          isNotNumber = false;
          break;
        }
      }
      if (isNotNumber) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Set number is not a number!' });
        this.isSetNumberValidCount++;
        return;
      }

      // If the set number is not valid, show an error message
      for (let i = 0; i < setNumFrom!.length; i++) {
        try {
          if (!await this.isSetNumber(+setNumFrom!.at(i)?.value)) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: `Invalid set number: ${setNumFrom!.at(i)?.value}` });
            this.isSetNumberValidCount++;
          } else {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: `Valid set number: ${setNumFrom!.at(i)?.value}` });
          }
        } catch (error) {
          // If there is an error, show an error message
          console.error(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: `Error checking set number: ${setNumFrom!.at(i)?.value}` });
          this.isSetNumberValidCount++;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getPartCount(setNumber: number): Promise<number> {
    const response = await fetch(`https://rebrickable.com/api/v3/lego/sets/${setNumber}-1/`, {
      headers: {
        'Authorization': `key ${rebrickableKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.num_parts;
  }

  // Substitute non-standard part IDs in CSV file with Rebrickable IDs
  // Written with assistance from Copilot
  async processCSV(file: File) {
    Papa.parse(file, {
      complete: async (result) => {
        const data = result.data as CSVRow[];
        const columnIndex = 2; // Ldraw column

        const standardizedCSV = await Promise.all(
          data.map(async (row: CSVRow) => {
            row[columnIndex] = await this.standardizePartId(row[columnIndex] || '');
            return row;
          })
        );

        const csvString = Papa.unparse(standardizedCSV);
        const standardizedCSVFile = new File([csvString], file.name, { type: file.type });

        this.uploadedCSVs = [standardizedCSVFile];
      }
    });
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

  isNumeric(str: string): boolean {
    return /^\d+$/.test(str);
  }
}
