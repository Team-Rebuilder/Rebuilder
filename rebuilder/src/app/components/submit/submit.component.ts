import { Component, inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { TreeSelectModule } from 'primeng/treeselect';
import { FileUpload, FileUploadModule, UploadEvent } from 'primeng/fileupload';

import { ModelsService } from '../../services/models.service';
import { CategoryService } from '../../services/category.service';
import { HomeComponent } from '../homenavbar/home.component';

// Declaration of Border Colors
const DEFAULT_COLOR = "#E0E0E0";

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
    FileUploadModule
  ],
  // encapsulation: ViewEncapsulation.None,
  templateUrl: './submit.component.html',
  styleUrl: './submit.component.css'
})
export class SubmitComponent {
  modelsService = inject(ModelsService);

  SubmitForm: FormGroup;
  submissionValue: any; // Can be any type
  username: string = localStorage.getItem('username') || '';
  usernameSet: boolean = false;
  formSubmitted: boolean = false;

  borderStyle: string = `${ DEFAULT_COLOR } 2px solid`;

  // Temporary example
  // Taken from: https://primeng.org/treeselect#filter
  nodes!: any[];
  selectedNodes: any;

  // Uploaded Image
  uploadedImages: File[] = [];
  uploadedPDFs: File[] = [];
  uploadedCSVs: File[] = [];
  uploadedDAEs: File[] = [];

  constructor(private categoryService: CategoryService) {
    this.categoryService.getFiles().then((files) => (this.nodes = files));

    this.SubmitForm = new FormGroup({
      title: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      imageFile: new FormControl('', Validators.required),
      instructionFile: new FormControl('', Validators.required),
      partsListFile: new FormControl(''),
      threemodelFile: new FormControl(''),
      // selectedNodes: new FormControl(),
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
    if (files) {
      switch (fileType) {
        case 'image':
          this.uploadedImages.push(...files);
          break;
        case 'pdf':
          this.uploadedPDFs.push(...files);
          break;
        case 'csv':
          this.uploadedCSVs.push(...files);
          break;
        case 'dae':
          this.uploadedDAEs.push(...files);
          break;
      }
    }
  }

  // TODO: Implement the submit function to Firebase
  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) {
      return;
    }

    try {
      // First, upload the files
      const imageUrls = this.uploadedImages.length ? await this.modelsService.uploadFiles(this.username, this.uploadedImages, 'image') : [];
      const pdfUrls = this.uploadedPDFs.length ? await this.modelsService.uploadFiles(this.username, this.uploadedPDFs, 'pdf') : [];
      const csvUrls = this.uploadedCSVs.length ? await this.modelsService.uploadFiles(this.username, this.uploadedCSVs, 'csv') : [];
      const daeUrls = this.uploadedDAEs.length ? await this.modelsService.uploadFiles(this.username, this.uploadedDAEs, 'dae') : [];

      // Then, submit the model
      const modeldata = {
        username: this.username,
        title: this.submissionValue.title,
        category: this.submissionValue.category,
        description: this.submissionValue.description,
        imageUrls: imageUrls,
        instructionUrls: pdfUrls,
        partsListUrls: csvUrls,
        threemodelUrls: daeUrls
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
    this.uploadedDAEs = [];

    this.formSubmitted = true;
  }

  isFormValid(): boolean {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
    return (
      (this.SubmitForm.get('title')?.valid ?? false) &&
      (this.SubmitForm.get('category')?.valid ?? false) &&
      (this.SubmitForm.get('description')?.valid ?? false) &&
      (this.uploadedImages.length > 0) &&  // At least one image is required
      (this.uploadedPDFs.length > 0) &&    // At least one PDF is required
      (this.uploadedCSVs.length > 0)       // At least one CSV is required
    );
  }

  deleteInfo(): void {
    this.submissionValue = null;
  }

  // Clear the form
  clearFormValue(content: string): void {
    this.SubmitForm.get(content)?.setValue(null);
    this.SubmitForm.get(content)?.reset();
  }
}
