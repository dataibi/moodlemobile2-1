import { QrReaderProvider } from './../../providers/qrReader';
import { CoreLoginCredentialsPage } from './../../core/login/pages/credentials/credentials';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Component, NgZone } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { Platform } from 'ionic-angular';

@Component({
	selector: 'qr-scanner-page',
	templateUrl: 'qr-scanner-page.html'
})
export class QrScannerPage {

	scanned: string = '';
	scanSubscribe;
	isLoginScan: boolean = false;
	callingComponent: any;
	typeOfQrCode: string;

	constructor(
		public navCtrl: NavController,
		private navParams: NavParams,
		private qrScanner: QRScanner,
		private zone: NgZone,
		private platform: Platform,
		private alertCtrl: AlertController,
		private qrReaderProvider: QrReaderProvider
	) {
		this.isLoginScan = navParams.get("isLogin");
		this.callingComponent = navParams.get("callingComponent");
	}

	ionViewDidEnter() {
		this.platform.ready().then(() => {
			this.openQr();

		});
	}

	ionViewWillLeave() {
		this.closeScanner();
	}

	closeScanner() {
		this.qrScanner.hide(); // hide camera preview
		this.scanSubscribe.unsubscribe(); // stop scanning
		this.hideCamera(); //remove css classes for the transparent background 
	}

	closeAndGoBack() {
		// this.closeScanner();
		if (this.navCtrl.canGoBack()) {
			this.navCtrl.pop();
		}
	}

	closeAndGoToComponent(component, params_object = {}) {
		// this.closeScanner();
		this.navCtrl.push(component, params_object);
	}

	safelyParseJSON(json) {
		// This function cannot be optimised, it's best to
		// keep it small!
		var parsed;

		try {
			parsed = JSON.parse(json);
		} catch (e) {
			console.log('json error');
			console.log(e);
			return false;
		}

		return parsed; // Could be undefined!
	}

	whatQrCodeIsIt() { //TODO: json string has to have a type property. so we don`t have to check so complicate
		let scanned_as_object: string | boolean = this.safelyParseJSON(this.scanned);

		switch (Object.keys(scanned_as_object)[0]) {
			case 'username':
				this.typeOfQrCode = 'login';
				break;
			case 'exponat_id':
				this.typeOfQrCode = 'exponate';
				break;
			default:
				this.typeOfQrCode = 'unknown';
		}
		console.log('scanned_as_object');
		console.log(scanned_as_object);
		console.log('typeOfQrCode');
		console.log(this.typeOfQrCode);
		
		return this.typeOfQrCode;
	}

	doesQrCodeAndCalledComponentMatch(): boolean {
		let typeOfQrCode = this.whatQrCodeIsIt();
		console.log('this.callingComponent instanceof CoreLoginCredentialsPage');
		console.log(this.callingComponent instanceof CoreLoginCredentialsPage);
		if (this.callingComponent && this.callingComponent instanceof CoreLoginCredentialsPage && typeOfQrCode === 'login') {
			return true;

		} else {
			return false;
		}
	}

	presentAlert() {
		let alert = this.alertCtrl.create({
			title: 'QR Code not correct',
			message: 'Please try another code for generated this app',
			buttons: [
				{
					text: 'OK',
					role: 'cancel',
					handler: () => {
						this.closeAndGoBack();
					}
				}
			]
		});
		alert.present();
	}



	isScanned() {
		return this.scanned !== '';
	}


	showCamera() {
		(window.document.querySelector('ion-app') as HTMLElement).classList.add('cameraView');
	}
	hideCamera() {
		(window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');
	}

	openQr() {
		// Optionally request the permission early
		this.qrScanner.prepare()
			.then((status: QRScannerStatus) => {
				if (status.authorized) {
					// camera permission was granted
					//alert('authorized');

					// start scanning
					this.scanSubscribe = this.qrScanner.scan().subscribe((text: string) => {
						// this.zone.run(
						// 	() => this.scanned = text
						// );

						// // alert(text);
						// this.qrScanner.hide(); // hide camera preview
						// this.scanSubscribe.unsubscribe(); // stop scanning
						// this.hideCamera();

						this.scanned = text;
						if (this.doesQrCodeAndCalledComponentMatch()) {
							switch (this.typeOfQrCode) {
								case 'login':
									this.qrReaderProvider.emitLoginData(this.scanned);
									// this.closeAndGoToComponent(CoreLoginCredentialsPage, {loginData: this.scanned});
									break;
								case 'exponat_id':
								//this.closeAndGoToComponent(CoreLoginCredentialsPage, {loginData: this.scanned});
									break;
								default:
								console.log('whats wrong here?');
							}
							
						} else {
							this.presentAlert();
						}


					});

					this.qrScanner.resumePreview();
					this.showCamera();
					// show camera preview
					this.qrScanner.show()
						.then((data: QRScannerStatus) => {
							console.log('datashowing', data);
							//alert(data.showing);
							// this.hideCamera();
						}, err => {
							//alert(err);

						});

					// wait for user to scan something, then the observable callback will be called

				} else if (status.denied) {
					alert('denied');
					// camera permission was permanently denied
					// you must use QRScanner.openSettings() method to guide the user to the settings page
					// then they can grant the permission from there
				} else {
					// permission was denied, but not permanently. You can ask for permission again at a later time.
					alert('else');
				}
			})
			.catch((e: any) => {
				alert('Error is' + e);
			});
	}
}
