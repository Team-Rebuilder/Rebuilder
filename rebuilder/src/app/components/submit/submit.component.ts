import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { TreeSelectModule } from 'primeng/treeselect';
import { ToastModule } from 'primeng/toast';
import { ScrollTopModule } from 'primeng/scrolltop';
import { MessageService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';

import { ModelsService } from '../../services/models.service';
import { HomeComponent } from '../homenavbar/home.component';
import { rebrickableKey } from '../../credentials';

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
    ScrollTopModule
  ],
  providers: [MessageService],
  // encapsulation: ViewEncapsulation.None,
  templateUrl: './submit.component.html',
  styleUrl: './submit.component.css'
})
export class SubmitComponent {
  modelsService = inject(ModelsService);

  SubmitForm: FormGroup;
  submissionValue: any; // Form submission value
  username: string = localStorage.getItem('username') || '';
  usernameSet: boolean = false;
  formSubmitted: boolean = false;
  isLoading: boolean = false;

  // Maximum file size (10 MB)
  MAX_FILE_SIZE = 10 * 1024 * 1024;

  // Temporary example
  // Taken from: https://primeng.org/treeselect#filter
  nodes!: any[];
  selectedNodes: any;

  // Uploaded Image
  uploadedImages: File[] = [];
  uploadedPDFs: File[] = [];
  uploadedCSVs: File[] = [];
  uploadedMPDs: File[] = [];

  constructor(private messageService: MessageService) {
    this.SubmitForm = new FormGroup({
      title: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      source: new FormControl('', Validators.required),
      imageFile: new FormControl('', Validators.required),
      instructionFile: new FormControl('', Validators.required),
      partsListFile: new FormControl(''),
      threemodelFile: new FormControl(''),
    });

    this.watchChanges();
  }

  // When the user changes the username
  onUserNameChange(userNameValue: string) {
    this.username = userNameValue;
    localStorage.setItem('username', this.username);
  }

  // Set the username
  setUsername(username: string): void {
    if (!username) {
      return;
    }
    this.usernameSet = true;
  }

  // Clear the username
  clearUsername(): void {
    this.username = '';
    localStorage.removeItem('username');
    this.usernameSet = false;
    this.formSubmitted = false;   // This would be false anyway before submitting the form
  }

  // Watch values that need validation (email, phonenumber)
  // https://www.tektutorialshub.com/angular/valuechanges-in-angular-forms/?__cf_chl_rt_tk=ZbKGfBk3fRzboWGJnzU73Iq29Vd7Qp_HbIek14wp5Os-1730573211-1.0.1.1-VTJ0NWSL5g5_xIePdM62KXNpbCq00bPFXD4ogKAze58
  watchChanges(): void {
    this.SubmitForm.valueChanges.subscribe((value) => {
      this.submissionValue = value;
    });
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

    // Set the loading state
    this.isLoading = true;

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
        source: this.submissionValue.source,
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
      (this.SubmitForm.get('source')?.valid ?? false) &&
      (this.uploadedImages.length > 0) &&  // At least one image is required
      (this.uploadedPDFs.length > 0)       // At least one PDF is required
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

    // Show a success message
    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'Form reset successfully!' });
  }

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
      console.error("Error", response);
      return false;
    }

    return true;
  }
}
