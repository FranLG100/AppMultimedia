import { Component, OnInit } from '@angular/core';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { ActionSheetController, Platform, ToastController } from '@ionic/angular';
import {
  MediaCapture,
  MediaFile,
  CaptureError
} from '@ionic-native/media-capture/ngx';
import { File, FileEntry } from '@ionic-native/File/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { AlertController } from '@ionic/angular';

const MEDIA_FOLDER_NAME = 'my_media';
var mediaName = '';
 
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
  files = [];
 
  constructor(
    private imagePicker: ImagePicker,
    private mediaCapture: MediaCapture,
    private file: File,
    private media: Media,
    private streamingMedia: StreamingMedia,
    private photoViewer: PhotoViewer,
    private actionSheetController: ActionSheetController,
    private plt: Platform,
    private alertController: AlertController
  ) {}
 
  ngOnInit() {
    console.log('Hola');
    this.plt.ready().then(() => {
      let path = 'file:///storage/emulated/0/';
      this.file.checkDir(path, MEDIA_FOLDER_NAME).then(
        () => {
          this.loadFiles();
        },
        err => {
          this.file.createDir(path, MEDIA_FOLDER_NAME, false);
        }
      );
    });
  }
 
  loadFiles() {
    //this.file.dataDirectory //MEDIA_FOLDER_NAME
    //this.file.applicationStorageDirectory
    this.file.listDir('file:///storage/emulated/0/',MEDIA_FOLDER_NAME).then(
      res => {
        this.files = res;
      },
      err => console.log('error loading files: ', err)
    );
  }

  async selectMedia() {
    const actionSheet = await this.actionSheetController.create({
      header: '¿Que deseas escoger?',
      buttons: [
        {
          text: 'Tomar Foto',
          handler: () => {

            this.captureImage();
          }
        },
        {
          text: 'Grabar Vídeo',
          handler: () => {
            this.recordVideo();
          }
        },
        {
          text: 'Grabar Audio',
          handler: () => {
            this.recordAudio();
          }
        },
        {
          text: 'Cargar fotos de Galería',
          handler: () => {
            this.pickImages();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }
 
  pickImages() {
    this.imagePicker.getPictures({}).then(
      results => {
        for (var i = 0; i < results.length; i++) {
          this.copyFileToLocalDir(results[i]);
        }
      }
    );
  }
 
  captureImage() {
    this.mediaCapture.captureImage().then(
      (data: MediaFile[]) => {
        if (data.length > 0) {
          this.copyFileToLocalDir(data[0].fullPath);
        }
      },
      (err: CaptureError) => console.error(err)
    );
  }
 
  recordAudio() {
    this.mediaCapture.captureAudio().then(
      (data: MediaFile[]) => {
        if (data.length > 0) {
          this.copyFileToLocalDir(data[0].fullPath);
        }
      },
      (err: CaptureError) => console.error(err)
    );
  }
 
  recordVideo() {
    this.mediaCapture.captureVideo().then(
      (data: MediaFile[]) => {
        if (data.length > 0) {
          this.copyFileToLocalDir(data[0].fullPath);
        }
      },
      (err: CaptureError) => console.error(err)
    );
  }

  async copyFileToLocalDir(fullPath) {
    
    let myPath = fullPath;
    mediaName='';
    // Make sure we copy from the right location
    console.log(myPath);
    if (fullPath.indexOf('file://') < 0) {
      myPath = 'file://' + fullPath;
      console.log(myPath);
    }
 
    const ext = myPath.split('.').pop();
    const d = Date.now();
    
 
    const name = myPath.substr(myPath.lastIndexOf('/') + 1);
    var newn=name.replace(/%20/g,' ');
    const copyFrom = myPath.substr(0, myPath.lastIndexOf('/') + 1);
    console.log(copyFrom);
    console.log(newn);
    console.log(name);
    const copyTo = this.file.dataDirectory + MEDIA_FOLDER_NAME;
    var finalName='';
    await this.presentAlertPrompt();
    if(mediaName=='')
      finalName = `${d}.${ext}`;
    else
      finalName=`${mediaName}.${ext}`;
    this.file.copyFile(copyFrom, newn, 'file:///storage/emulated/0/'+MEDIA_FOLDER_NAME, finalName).then(
      success => {
        this.loadFiles();
      },
      error => {
        console.log('error: ', error);
      }
    );
  }
 
  openFile(f: FileEntry) {
    if (f.name.indexOf('.mp3') > -1) {
      // We need to remove file:/// from the path for the audio plugin to work
      //const path =  f.nativeURL.replace(/^file:\/\//, '');
      //const audioFile: MediaObject = this.media.create(path);
      //audioFile.play();
      this.streamingMedia.playAudio(f.nativeURL);
    } else if (f.name.indexOf('.MOV') > -1 || f.name.indexOf('.mp4') > -1) {
      // E.g: Use the Streaming Media plugin to play a video
      this.streamingMedia.playVideo(f.nativeURL);
    } else if (f.name.indexOf('.jpg') > -1) {
      // E.g: Use the Photoviewer to present an Image
      this.photoViewer.show(f.nativeURL, f.name);
    }
  }
 
  deleteFile(f: FileEntry) {
    const path = f.nativeURL.substr(0, f.nativeURL.lastIndexOf('/') + 1);
    this.file.removeFile(path, f.name).then(() => {
      this.loadFiles();
    }, err => console.log('error remove: ', err));
  }

  async presentAlertPrompt() {
    const alert = await this.alertController.create({
      header: 'Nombre',
      inputs: [
        {
          name: 'Nombre',
          type: 'text',
          placeholder: 'Nombre'
        },
        {
          name: 'name2',
          type: 'text',
          id: 'name2-id',
          value: 'hello',
          placeholder: 'Placeholder 2'
        }
      ],
      buttons: [
        /*{
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        },*/ {
          text: 'Aceptar',
          handler: () => {
            console.log('Confirm Ok');
          }
        }
      ]
    });

    await alert.present();
    let result = await alert.onDidDismiss();
    console.log(result.data.values.Nombre);
    mediaName=result.data.values.Nombre;
  }
}


