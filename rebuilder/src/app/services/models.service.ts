import { Injectable } from '@angular/core';
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

  constructor() { }
}
