import { Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { ModelsComponent } from './components/models/models.component';
import { ModelComponent } from './components/model/model.component';
import { InstructionComponent } from './components/instruction/instruction.component';
import { RenderViewerComponent } from './components/render-viewer/render-viewer.component';
import { SubmitComponent } from './components/submit/submit.component';


export const routes: Routes = [
  { path: '', component: ModelsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'models', component: ModelsComponent },
  { path: 'submit', component: SubmitComponent },
  { path: 'model/:id/details', component: ModelComponent },
  { path: 'model/:id/three', component: RenderViewerComponent },
  { path: 'model/:id/instructions', component: InstructionComponent },
  { path: '**', redirectTo: '' }
];