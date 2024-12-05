import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  authState,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  user,
  getAuth,
  User,
} from '@angular/fire/auth';
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
import { map, switchMap, firstValueFrom, filter, Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';

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
  // Get Firebase services
  // https://github.com/firebase/codelab-friendlychat-web/blob/main/angularfire-start/src/app/services/chat.service.ts
  auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);
  router: Router = inject(Router);
  private provider = new GoogleAuthProvider();
  LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

  // observable that is updated when the auth state changes
  // user$ = user(this.auth);
  // currentUser: User | null = this.auth.currentUser;
  // userSubscription: Subscription;

  public models$: Observable<Model[]>;

  // Create a reference to the storage service
  storageRef = ref(this.storage);

  private docId: string = '';

  // Create a reference to the models collection
  modelsRef = collection(this.firestore, 'models');

  constructor() {
    const q = query(this.modelsRef, orderBy('timestamp', 'desc'));
    this.models$ = collectionData(q) as Observable<Model[]>;

    // Subscribe to the user observable
    // this.userSubscription = this.user$.subscribe((aUser: User | null) => {
    //   this.currentUser = aUser;
    // });
  }

  // TODO: Replace username with authentication
  // HANDLE AUTHENTICATION
  // login() {
  //   signInWithPopup(this.auth, this.provider).then((result) => {
  //       const credential = GoogleAuthProvider.credentialFromResult(result);
  //       this.router.navigate(['/', 'models']);
  //       return credential;
  //   })
  // }

  // logout() {
  //   signOut(this.auth).then(() => {
  //       this.router.navigate(['/', 'login'])
  //       console.log('signed out');
  //   }).catch((error) => {
  //       console.log('sign out error: ' + error);
  //   })
  // }


  // Handle Submitting a new Model
  // First, Ask username before proceeding (for getting unique id so that files can be stored in the user's directory)
  // When user enters a submit page and types something in the input field,
  //   it will add a new document to the models collection, with empty fields
  // Then, as user fills out the form, it will temporarily store the data locally
  // For images, partslist and instructions, it will upload the files to the storage service, and update the document with the urls
  // Finally, when user clicks submit, it will update the document with the final data (that are stored locally)


  // 1. Add a new document to the models collection with username
  addModel = async (userName: string) => {
    const newModelRef = await addDoc(this.modelsRef, {
      userName: userName,
      title: '',
      category: '',
      timestamp: Timestamp.now(),
      description: '',
      imageUrl: '',
      partsListUrl: '',
      instructionUrl: '',
      threemodelUrl: ''
    });
    this.docId = newModelRef.id;
  }



}
