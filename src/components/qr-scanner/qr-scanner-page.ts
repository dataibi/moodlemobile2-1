import { QrReaderProvider } from './../../providers/qrReader';
import { CoreLoginCredentialsPage } from './../../core/login/pages/credentials/credentials';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { Platform } from 'ionic-angular';

@Component({
	selector: 'qr-scanner-page',
	templateUrl: 'qr-scanner-page.html'
})
export class QrScannerPage {

	@ViewChild('sendbutton', { read: ElementRef }) sendbutton: ElementRef;

	scanned: string = '';
	scanSubscribe;
	isLoginScan: boolean = false;
	callingComponent: any;
	typeOfQrCode: string;
	courseData: any

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
		console.log('this.qrReaderProvider.getCourseData()');
		console.log(this.qrReaderProvider.getCourseData());
	}

	ionViewWillLeave() {
		this.closeScanner();
	}

	closeScanner() {
		this.scanSubscribe.unsubscribe(); // stop scanning
		this.hideCamera(); //remove css classes for the transparent background 
		return this.qrScanner.destroy(); // destroy instance
	}

	closeAndGoBack() {
		if (this.navCtrl.canGoBack()) {
			this.navCtrl.pop();
		}
	}

	closeAndGoToComponent(component, params_object = {}) {
		this.navCtrl.push(component, params_object);
	}

	/**
     * parse json safely
     *
     * @param {any} json should be a string
     * @return {any} false, undefined, or an object
     */
	safelyParseJSON(json): any {
		// This function cannot be optimised, it's best to
		// keep it small!
		let parsed;
		try {
			parsed = JSON.parse(json);
		} catch (e) {
			return false;
		}
		return parsed; // Could be undefined!
	}

	whatQrCodeIsIt() {
		let scanned_as_object: any = this.safelyParseJSON(this.scanned);

		if (scanned_as_object.qrType && scanned_as_object.qrType !== 'undefined') {
			switch (scanned_as_object.qrType) {
				case 'login':
					this.typeOfQrCode = 'login';
					break;
				case 'exponate':
					this.typeOfQrCode = 'exponate';
					break;
				default:
					this.typeOfQrCode = 'unknown';
			}
		} else {
			this.typeOfQrCode = 'unknown';
		}
		return this.typeOfQrCode;
	}

	doesQrCodeAndCalledComponentMatch(): boolean {
		let typeOfQrCode = this.whatQrCodeIsIt();
		if (this.callingComponent && this.callingComponent instanceof CoreLoginCredentialsPage && typeOfQrCode === 'login') {
			return true;

		} else {
			return false;
		}
	}

	presentAlert() {
		let alert = this.alertCtrl.create({
			title: 'QR Code not correct',
			message: 'Please try another code generated for this project',
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

	/**
     * test permission for scanner, open camera for qr reader and create subscription for scanned material
     */
	openQr() {
		// Optionally request the permission early
		this.qrScanner.prepare()
			.then((status: QRScannerStatus) => {
				if (status.authorized) {
					// camera permission was granted

					// start scanning
					this.scanSubscribe = this.qrScanner.scan().subscribe((text: string) => {
						// this.zone.run(
						// 	() => this.scanned = text
						// );

						this.scanned = text;
						if (this.doesQrCodeAndCalledComponentMatch()) {
							this.sendbutton.nativeElement.click(); //have to go this curious way with Elementref and trigger click, cause fire event here in subscription don`t work well (takes very long)
						} else {
							this.presentAlert();
						}


					});

					this.showCamera();
					// show camera preview
					this.qrScanner.show()
						.then((data: QRScannerStatus) => {
							console.log('datashowing', data);
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

	sendJson() {
		if (this.typeOfQrCode === 'login') {
			this.qrReaderProvider.emitLoginData(this.scanned);
		}
	}
}
