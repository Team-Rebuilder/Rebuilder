import { Component, inject, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { TreeSelectModule } from 'primeng/treeselect';
import { FileUploadModule } from 'primeng/fileupload';

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

  username: string = '';
  usernameSet: boolean = false;

  borderStyle: string = `${ DEFAULT_COLOR } 2px solid`;

  // Temporary example
  // Taken from: https://primeng.org/treeselect#filter
  nodes!: any[];
  selectedNodes: any;

  // Uploaded Image
  uploadedImages: any[] = [];
  uploadedPDFs: any[] = [];
  uploadedCSVs: any[] = [];
  uploadedDAEs: any[] = [];

  constructor(private categoryService: CategoryService) {
    this.categoryService.getFiles().then((files) => (this.nodes = files));

    this.SubmitForm = new FormGroup({
      username: new FormControl('', Validators.required),
      title: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      imageUrl: new FormControl('', Validators.required),
      instructionUrl: new FormControl('', Validators.required),
      partsListUrl: new FormControl(''),
      threemodelUrl: new FormControl(''),
      // selectedNodes: new FormControl(),
    });

    this.watchChanges();
  }

  // Set the username
  setUsername(username: string): void {
    this.username = username;
    this.usernameSet = true;
  }

  // Clear the username
  clearUsername(): void {
    this.username = '';
    this.usernameSet = false;
  }

  // Watch values that need validation (email, phonenumber)
  // https://www.tektutorialshub.com/angular/valuechanges-in-angular-forms/?__cf_chl_rt_tk=ZbKGfBk3fRzboWGJnzU73Iq29Vd7Qp_HbIek14wp5Os-1730573211-1.0.1.1-VTJ0NWSL5g5_xIePdM62KXNpbCq00bPFXD4ogKAze58
  watchChanges(): void {
    this.SubmitForm.valueChanges.subscribe((value) => {
      this.submissionValue = value;
    });
  }

  // Handle the file upload: Image
  // https://github.com/firebase/codelab-friendlychat-web/blob/main/angularfire-start/src/app/pages/chat-page/chat-page.component.ts
  onUploadImage(event: any): void {
    const imgFile: File = event.target.files[0];
    if (!imgFile) {
      return;
    }

    // this.modelsService.uploadImage(imgFile);
    console.log(event);
  }

  // Handle the file upload: PDF
  onUploadPDF(event: any): void {
    // for (let file of event.files) {
    //   this.uploadedPDFs.push(file);
    // }
    console.log(event);
  }

  // Handle the file upload: CSV
  onUploadCSV(event: any): void {
    // for (let file of event.files) {
    //   this.uploadedCSVs.push(file);
    // }
    console.log(event);
  }

  // Handle the file upload: DAE
  onUploadDAE(event: any): void {
    // for (let file of event.files) {
    //   this.uploadedDAEs.push(file);
    // }
    console.log(event);
  }

  // TODO: Implement the submit function to Firebase
  onSubmit(): void {
    if (this.isFormValid()) {
      console.log(this.submissionValue);
    }
  }

  isFormValid(): boolean {
    return this.SubmitForm.valid;
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
