import { Component, ElementRef, OnInit, inject, input, viewChild } from '@angular/core';
import { ModelnavbarComponent } from '../modelnavbar/modelnavbar.component';
/* @vite-ignore */
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { ModelsService } from '../../services/models.service';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.9.155/build/pdf.worker.min.mjs`;
;

@Component({
  selector: 'app-instruction',
  standalone: true,
  imports: [ModelnavbarComponent, MatSliderModule, FormsModule],
  templateUrl: './instruction.component.html',
  styleUrl: './instruction.component.css'
})

// This component was adapted from a ChatGPT generation:
// https://chatgpt.com/share/67529b54-7d84-8001-ab91-74f2566228d3
export class InstructionComponent {
  modelsService = inject(ModelsService);

  src = input.required<string>();
  modelCanvas = viewChild<ElementRef>("canvas");
  pdf: PDFDocumentProxy | null = null;
  pdfUrl: string = "";
  currentPage: number = 1;
  pageCount: number = 0;

  ngOnInit(): void {
    this.modelsService.models$.subscribe(models => {
      this.pdfUrl = models[0].instructionUrls[0];
      this.loadPdf();
    });

  }

  async loadPdf() {
    const pdf = await pdfjsLib.getDocument(this.pdfUrl).promise;
    this.pdf = pdf;
    this.pageCount = pdf.numPages;
    this.renderPage(this.currentPage);
  }

  async renderPage(pageNumber: number) {
    if (this.pdf) {
      const page = await this.pdf.getPage(pageNumber);
  
      const canvas = this.modelCanvas()?.nativeElement;
      const context = canvas.getContext('2d')!;
      const viewport = page.getViewport({ scale: 1.5 });
  
      canvas.width = viewport.width;
      canvas.height = viewport.height;
  
      page.render({ canvasContext: context, viewport: viewport });
    }
  }

  nextPage() {
    if (this.currentPage < this.pageCount) {
      this.currentPage++;
      this.renderPage(this.currentPage);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderPage(this.currentPage);
    }
  }

  goToPage(e: Event) {
      this.renderPage(this.currentPage);
  }
}
