import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
    getFirestore, collection, getDocs, doc, getDoc,
    addDoc, updateDoc, deleteDoc, query, where
} from 'firebase/firestore';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface AccessCode {
    id?: string;
    code: string;
    name?: string;
    isActive: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {
    private app = initializeApp(environment.firebase);
    private db = getFirestore(this.app);
    private collectionName = 'codes';

    constructor() {
        console.log('FirebaseService: Inicializácia Firebase');
    }

    // Získanie všetkých prístupových kódov
    getAccessCodes(): Observable<AccessCode[]> {
        const codesCollection = collection(this.db, this.collectionName);

        return from(getDocs(codesCollection)).pipe(
            map(snapshot => {
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as AccessCode[];
            }),
            catchError(error => {
                console.error('Chyba pri načítaní prístupových kódov', error);
                return of([]);
            })
        );
    }

    // Pridanie nového prístupového kódu
    addAccessCode(accessCode: AccessCode): Promise<any> {
        const codesCollection = collection(this.db, this.collectionName);
        return addDoc(codesCollection, accessCode);
    }

    // Aktualizácia existujúceho prístupového kódu
    updateAccessCode(id: string, accessCode: Partial<AccessCode>): Promise<void> {
        const docRef = doc(this.db, this.collectionName, id);
        return updateDoc(docRef, accessCode as any);
    }

    // Odstránenie prístupového kódu
    deleteAccessCode(id: string): Promise<void> {
        const docRef = doc(this.db, this.collectionName, id);
        return deleteDoc(docRef);
    }

    // Overenie, či je prístupový kód platný
    async verifyAccessCode(code: string): Promise<boolean> {
        try {
            const codesCollection = collection(this.db, this.collectionName);
            const q = query(codesCollection, where('code', '==', code));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return false;
            }

            // Berieme prvý dokument so zhodným kódom
            const document = querySnapshot.docs[0];
            const data = document.data() as AccessCode;

            // Kontrolujeme, či je kód aktívny
            return data.isActive === true;
        } catch (error) {
            console.error('Chyba pri overovaní kódu', error);
            return false;
        }
    }

    // Získanie hodnoty TestCode z Firestore
    async getTestCode(): Promise<string | null> {
        try {
            const docRef = doc(this.db, this.collectionName, 'wi4LRBIRZc0AbooImroy');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as any;
                return data?.TestCode || null;
            }

            return null;
        } catch (error) {
            console.error('Chyba pri načítaní TestCode', error);
            return null;
        }
    }
}