import { inject, Injectable, signal } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  updateDoc,
  query,
  orderBy,
  deleteDoc,
  doc,
  DocumentReference,
  Timestamp
} from '@angular/fire/firestore';
import { Storage, ref } from '@angular/fire/storage';
import { Observable } from 'rxjs';

export interface Model {
  id: number;
  userName: string;
  title: string;
  category: string;
  timestamp: Timestamp;
  description: string;
  imageUrl: string;
  partsListUrl: string;
  instructionUrl: string;
  threemodelUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModelsService {
  // public models$ = signal<Model[]>([]);
  public models$: Observable<Model[]>;    // Which one is better? Signal or Observable?

  // Get firestore and storage
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);

  // Create a reference to the storage service
  storageRef = ref(this.storage);

  private docId: string = '';

  // Create a reference to the models collection
  modelsRef = collection(this.firestore, 'models');

  constructor() {
    const q = query(this.modelsRef, orderBy('timestamp', 'desc'));
    this.models$ = collectionData(q) as Observable<Model[]>;
  }

  // Handle Submitting a new Model
  // First, when user enters a submit page, it will add a new document to the models collection, with empty fields
  // Then, as user fills out the form, it will temporarily store the data locally
  // For images, partslist and instructions, it will upload the files to the storage service, and update the document with the urls
  // Finally, when user clicks submit, it will update the document with the final data (that are stored locally)

  // first step: add a new document to the models collection, with empty fields
  // async addModel(model: Model) {
  //   addDoc(this.modelsRef, model)
  //     .then((docRef: DocumentReference) => {
  //       this.docId = docRef.id;
  //     });
  // }


}
