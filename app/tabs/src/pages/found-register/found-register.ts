import { Component, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { NavController, ViewController, ToastController, LoadingController, ModalController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { UserPage } from '../../providers/user'
import { Api } from '../../providers/api'
import { ListMasterPage } from "../list-master/list-master";
import { FoundPage } from "../found/found";
import { MainPage } from '../../pages/pages';
import { Animals } from '../../providers/providers';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'page-found-register',
  templateUrl: 'found-register.html'
})
export class FoundRegisterPage {
  @ViewChild('fileInput') fileInput;

  isReadyToSave: boolean;

  animal: any;

  form: FormGroup;

  imageLoaded: boolean;

  body: any;

  specie: any;

  imageData: any;

  animalForm: any;

  speciesList: any;

  breedsList: any;

  updatedBreedsList: any;

  sizesList: any;

  specieModel: any;

  animalsData: any;

  showLoading: boolean;

  animalModel: any;

  selectedSpecie: any;

  selectedBreed: any;

  selectedSize: any;

  breedModel: any;

  sizeModel: any;

  showSkip: boolean;

  loading: any;

  ipAddress: any;

  listMaster: any;

  constructor(public geolocation: Geolocation, public api: Api, public loadingCtrl: LoadingController, public toastCtrl: ToastController, public navCtrl: NavController, public viewCtrl: ViewController, formBuilder: FormBuilder, private camera: Camera, public http: Http, public user: UserPage, public modalCtrl: ModalController) {
    this.form = formBuilder.group({
      profilePic: [''],
      name: ['', Validators.required],
      address: [''],
      species: [''],
      breed: [''],
      gender: [''],
      size: [''],
      neighbor: [''],
      city: ['']
    });

    this.imageLoaded = false;
    this.showLoading = false;
    this.showSkip = true;

    this.api.getIP().then((data)=>{
      // this.ipAddress = data
      this.ipAddress = 'http://' + this.api.url
      if (this.ipAddress == 'http://undefined'){
        this.ipAddress = 'http://localhost'
      }
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      this.http.get(this.ipAddress + ':3000/animal_data', {headers: headers})
        .map(res => res.json())
        .subscribe(data => {
          this.animalsData = data;
          this.loadData(this.animalsData)
        });

      // Watch the form for changes, and
      this.form.valueChanges.subscribe((v) => {
        this.isReadyToSave = this.form.valid;
      });

      this.geolocation.watchPosition();

    })

    this.loading = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Analisando imagem...'
    });

  }

  getLocation() {
    console.log("Funcao de local!")
    this.geolocation.getCurrentPosition().then((data) => {
      console.log('My latitude : ', data.coords.latitude);
      console.log('My longitude: ', data.coords.longitude);
      console.log(JSON.stringify(data))
    })
    .catch((err)=>{
      console.log("Error")
      console.log(JSON.stringify(err))
    });
  }

  loadData(data) {
    console.log("Carregando listas dos animais...")
    this.speciesList = []
    this.breedsList = []
    this.sizesList = []
    var i;
    for (i=0;i<data.species.length;i++){
      this.speciesList.push(data.species[i])
    }
    for (i=0;i<data.breeds.length;i++){
      this.breedsList.push(data.breeds[i])
    }
    for (i=0;i<data.size.length;i++){
      this.sizesList.push(data.size[i])
    }
  }

  updateBreed(){
    this.updatedBreedsList = []
    var i, j;
    for (j=0;j<this.speciesList.length;j++){
      if (this.speciesList[j].nome == this.specieModel){
        this.selectedSpecie = this.speciesList[j].id
        break
      }
    }
    for (i=0;i<this.breedsList.length;i++){
      if (this.breedsList[i].especie_id == this.selectedSpecie){
      this.updatedBreedsList.push(this.breedsList[i])
    }
    }
  }

  ionViewDidLoad() {
  }

  getPicture() {
    const options: CameraOptions = {
      quality : 75, 
      destinationType : this.camera.DestinationType.DATA_URL, 
      sourceType : this.camera.PictureSourceType.CAMERA, 
      allowEdit : false,
      encodingType: this.camera.EncodingType.JPEG,
      targetWidth: 300,
      targetHeight: 300,
      saveToPhotoAlbum: true,
      correctOrientation: true
    }
    if (Camera['installed']()) {
      console.log("Camera instalada")
      this.camera.getPicture(options).then((data) => {
        this.form.patchValue({ 'profilePic': 'data:image/jpg;base64,' + data });
        this.processCameraImage('data:image/jpg;base64,' + data)
      }, (err) => {
        alert('Unable to take photo');
        alert(err)
        this.fileInput.nativeElement.click();
      })
    } else {
      console.log("Não achou a camera")
      // this.imageLoaded = true;
      this.fileInput.nativeElement.click();
    }
  }

  skipImage() {
    this.imageLoaded = true;
    this.showSkip = false;
  }

  processCameraImage(imageData){
    this.ipAddress = 'http://' + this.api.url
    if (this.ipAddress == 'http://undefined'){
      this.ipAddress = 'http://localhost'
    }
    // if (!this.loading){
      this.loading.present()
    // }
    console.log("Processando Imagem...")

    var promise;
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let body = {
      'img1': imageData
    };

    promise = this.http.post(this.ipAddress + ':3000/create_found_pet', body, {headers: headers})
      .map(res => res.json())
      .subscribe((data) => {
        console.log("Resultado de Análise Recebida!")
        let i = 0;
        for (i=0;i<data.image1.length;i++){
          if (data.image1[i] == 'whiskers' || data.image1[i] == 'cat like mammal' || data.image1[i] == 'dog breed' || data.image1[i] == 'mammal' || data.image1[i] == 'vertebrate' || data.image1[i] == 'dog like mammal'){
            data.image1.splice(i,1)
          }
          if (data.image1[i] == 'dog'){
            data.image1[i] = 'Cachorro'
          }
          else if (data.image1[i] == 'cat'){
            data.image1[i] = 'Gato'
          }
          else if (data.image1[i] == 'shetland sheepdog'){
            data.image1[i] = 'Pastor de Shetland'
          }
          else if (data.image1[i] == 'golden retriever'){
            data.image1[i] = 'Golden Retriever'
          }
          else if (data.image1[i] == 'english cocker spaniel'){
            data.image1[i] = 'Cocker Spaniel'
          }
        }
        var j;
        for (j=0;j<this.speciesList.length;j++){
          for(i=0;i<data.image1.length;i++){
            if (this.speciesList[j].nome == data.image1[i]){
              this.specieModel = this.speciesList[j].nome
              Promise.resolve()
              this.imageLoaded = true
              if (this.loading){
                this.loading.dismiss()
              }
              this.updateBreed()
              break
            }
          }
        }
        //Sugere Raça
        for (j=0;j<this.breedsList.length;j++){
          for(i=0;i<data.image1.length;i++){
            if (this.breedsList[j].nome == data.image1[i]){
              this.breedModel = this.breedsList[j].nome
              Promise.resolve()
              this.imageLoaded = true
              break
            }
          }
        }
      },
      (err) => {
        let toast = this.toastCtrl.create({
          message: "Não foi possível analisar a imagem. Por favor, preencha os campos abaixo",
          duration: 3000,
          position: 'top'
        });
        toast.present();
        this.imageLoaded = true
        if (this.loading){
          this.loading.dismiss()
        }
      });
  }

  processWebImage(event) {
    this.ipAddress = 'http://' + this.api.url
    if (this.ipAddress == 'http://undefined'){
      this.ipAddress = 'http://localhost'
    }
    // let toast = this.toastCtrl.create({
    //         message: "Dentro process",
    //         duration: 2000,
    //         position: 'bottom'
    //       });
    //       toast.present();
    // if (!this.loading){
      this.loading.present()
    // }
    console.log("Processando Imagem...")
    let reader = new FileReader();
    reader.onload = (readerEvent) => {
      this.imageData = (readerEvent.target as any).result;
      this.form.patchValue({ 'profilePic': this.imageData });

      var promise;
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      let body = {
        'img1': this.imageData
      };

      promise = this.http.post(this.ipAddress + ':3000/create_found_pet', body, {headers: headers})
        .map(res => res.json())
        .subscribe((data) => {
          console.log("Resultado de Análise Recebida!")
          let i = 0;
          for (i=0;i<data.image1.length;i++){
            if (data.image1[i] == 'whiskers' || data.image1[i] == 'cat like mammal' || data.image1[i] == 'dog breed' || data.image1[i] == 'mammal' || data.image1[i] == 'vertebrate' || data.image1[i] == 'dog like mammal'){
              data.image1.splice(i,1)
            }
            if (data.image1[i] == 'dog'){
              data.image1[i] = 'Cachorro'
            }
            else if (data.image1[i] == 'cat'){
              data.image1[i] = 'Gato'
            }
            else if (data.image1[i] == 'shetland sheepdog'){
              data.image1[i] = 'Pastor de Shetland'
            }
            else if (data.image1[i] == 'golden retriever'){
              data.image1[i] = 'Golden Retriever'
            }
            else if (data.image1[i] == 'english cocker spaniel'){
              data.image1[i] = 'Cocker Spaniel'
            }
          }
          var j;
          for (j=0;j<this.speciesList.length;j++){
            for(i=0;i<data.image1.length;i++){
              if (this.speciesList[j].nome == data.image1[i]){
                this.specieModel = this.speciesList[j].nome
                Promise.resolve()
                this.imageLoaded = true
                if (this.loading){
                  this.loading.dismiss()
                }
                this.updateBreed()
                break
              }
            }
          }
          //Sugere Raça
          for (j=0;j<this.breedsList.length;j++){
            for(i=0;i<data.image1.length;i++){
              if (this.breedsList[j].nome == data.image1[i]){
                this.breedModel = this.breedsList[j].nome
                Promise.resolve()
                this.imageLoaded = true
                break
              }
            }
          }
        },
        (err) => {
          let toast = this.toastCtrl.create({
            message: "Não foi possível analisar a imagem. Por favor, preencha os campos abaixo",
            duration: 3000,
            position: 'top'
          });
          toast.present();
          this.imageLoaded = true
          if (this.loading){
            this.loading.dismiss()
          }
        });
    };

    reader.readAsDataURL(event.target.files[0]);
    
  }

  getProfileImageStyle() {
    return 'url(' + this.form.controls['profilePic'].value + ')'
  }

  /**
   * The user cancelled, so we dismiss without sending data back.
   */
  cancel() {
    this.viewCtrl.dismiss();
  }

  /**
   * The user is done and wants to create the item, so return it
   * back to the presenter.
   */
  done() {
    this.animalForm = new Object()
    console.log("Salvando formulário")
    var j,i;
    for (j=0;j<this.breedsList.length;j++){
      if (this.breedsList[j].nome == this.breedModel){
        this.selectedBreed = this.breedsList[j].id
        break
      }
    }
    for (i=0;i<this.sizesList.length;i++){
      if (this.sizesList[i].nome == this.sizeModel){
        this.selectedSize = this.sizesList[i].id
        break
      }
    }
    this.user.getUser().then((data) => {
      var usuario;
      var usr = JSON.parse(data);
      if (usr.id){
        usuario = usr.id
      }
      else {
        usuario = usr
      }

      console.log(this.form.controls)

      this.animalForm = {
      'city': this.form.controls['city'].value,
      'neighbor': this.form.controls['neighbor'].value,
      'address': this.form.controls['address'].value,
      'breed': this.selectedBreed,
      'gender': this.form.controls['gender'].value,
      'name': this.form.controls['name'].value,
      'size': this.selectedSize,
      'species': this.selectedSpecie,
      'image': this.form.controls['profilePic'].value,
      'user': usuario
      }

      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      let body = {
        'form': this.animalForm
      };
      this.ipAddress = 'http://' + this.api.url
      if (this.ipAddress == 'http://undefined'){
        this.ipAddress = 'http://localhost'
      }

      this.http.post(this.ipAddress + ':3000/create_found_pet', body, {headers: headers})
        .map(res => res.json())
        .subscribe(data => {
          console.log("Retorno depois de criar animal")
          if (data.success == 'sucesso'){
            let toast = this.toastCtrl.create({
              message: "Animal Encontrado cadastrado com sucesso!",
              duration: 3000,
              position: 'top'
            });
            toast.present();
            this.viewCtrl.dismiss(this.form.value);
            if (data.exist == true){
              // EXISTE ANIMAL PARECIDO!!!
              console.log("Existe Animal Parecido!!")
              let toast = this.toastCtrl.create({
                message: "Encontramos um Animal Perdido semelhante!",
                duration: 4000,
                position: 'top'
              });
              toast.present();
            }
            // this.navCtrl.push(FoundPage);
          }
          else if (data.success == 'erro'){
            let toast = this.toastCtrl.create({
              message: "Erro ao cadastrar animal!",
              duration: 3000,
              position: 'top'
            });
            toast.present();
          }
        });
      if (!this.form.valid) { return; }
    })
  }
}
