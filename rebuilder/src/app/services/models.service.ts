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
  Timestamp,
  DocumentData,
  getDoc
} from '@angular/fire/firestore';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { map, switchMap, firstValueFrom, filter, Observable, Subscription, timestamp } from 'rxjs';
import { Router } from '@angular/router';

export interface Model {
  id: number;
  userName: string;
  title: string;
  category: string;
  timestamp: Timestamp;
  description: string;
  sourceSets: number[];
  sourcePartCount: number;
  imageUrls: string[];
  partsListUrls: string[];
  instructionUrls: string[];
  threemodelUrls: string[];
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

  // observable that is updated when the auth state changes
  user$ = user(this.auth);
  currentUser: User | null = this.auth.currentUser;
  userSubscription: Subscription;

  public models$: Observable<Model[]>;

  // Create a reference to the storage service
  storageRef = ref(this.storage);

  // Variables for the document
  docId: string = '';

  // Create a reference to the models collection
  modelsRef = collection(this.firestore, 'models');

  constructor() {
    const q = query(this.modelsRef, orderBy('timestamp', 'desc'));
    this.models$ = collectionData(q) as Observable<Model[]>;

    // Subscribe to the user observable
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      this.currentUser = aUser;
    });
  }

  // HANDLE AUTHENTICATION
  login() {
    signInWithPopup(this.auth, this.provider).then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      return credential;
    })
  }

  logout() {
    signOut(this.auth).then(() => {
      console.log('signed out');
    }).catch((error) => {
      console.log('sign out error: ' + error);
    })
  }

  // Submit a model to the database
  submitModel = async (modeldata: any) => {
    await addDoc(this.modelsRef, {
      userName: modeldata.username,
      uid: this.currentUser!.uid || '',
      userPhoto: this.currentUser!.photoURL || '',
      title: modeldata.title,
      category: modeldata.category,
      timestamp: Timestamp.now(),
      description: modeldata.description,
      sourceSets: modeldata.sourceSets,
      sourcePartCount: modeldata.sourcePartCount,
      imageUrls: modeldata.imageUrls,
      instructionUrls: modeldata.instructionUrls,
      partsListUrls: modeldata.partsListUrls,
      threemodelUrls: modeldata.threemodelUrls
    }).then((docRef: DocumentReference) => {
      // Update the document with the id
      updateDoc(docRef, { id: docRef.id });

      // Also store the document id
      this.docId = docRef.id;
    }).catch((error: any) => {
      console.error('Error adding document: ', error);
    });
  }

  // Handle file uploads (written with the help of AI)
  // https://firebase.google.com/docs/storage/web/upload-files
  uploadFiles = async (username: string, files: File[], filetype: string) => {
    const uploadPromises = files.map(async (file) => {
      const filePath = `${username}/${filetype}/${file.name}`;
      const fileRef = ref(this.storage, filePath);
      await uploadBytesResumable(fileRef, file);

      // Generate a public URL for the file.
      const publicFileURL = await getDownloadURL(fileRef);
      return publicFileURL;
    });

    // Wait for all the upload promises to complete
    const uploadedFilesUrls = await Promise.all(uploadPromises);
    return uploadedFilesUrls;
  }

  // Get a model by id
  // https://www.youtube.com/watch?v=sw3b8bVY2UQ&ab_channel=SoftAuthor
  getModelById = async (id: string) => {
    const modelRef = doc(this.firestore, 'models', id);
    const modelSnap = await getDoc(modelRef);

    if (!modelSnap.exists()) {
      console.error('No such document!');
    }
    return modelSnap.data() as Model;
  }

  // Delete a model
  deleteModel = async (id: string) => {
    const modelRef = doc(this.firestore, 'models', id);
    await deleteDoc(modelRef);
  }
}
