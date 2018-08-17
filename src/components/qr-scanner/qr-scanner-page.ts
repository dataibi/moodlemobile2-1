// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { QrReaderProvider } from './../../providers/qrReader';
import { CoreLoginCredentialsPage } from './../../core/login/pages/credentials/credentials';
import { NavController, NavParams, AlertController, Platform } from 'ionic-angular';
// Was: import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';

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

	constructor(
		public navCtrl: NavController,
		navParams: NavParams,
		private qrScanner: QRScanner,
// Was:		private zone: NgZone,
		private platform: Platform,
		private alertCtrl: AlertController,
		private qrReaderProvider: QrReaderProvider
	) {
		this.isLoginScan = navParams.get('isLogin');
		this.callingComponent = navParams.get('callingComponent');
	}

	ionViewDidEnter(): void {
		this.platform.ready().then(() => {
			this.openQr();

		});
	}

	ionViewWillLeave(): void {
		this.closeScanner();
	}

	closeScanner(): Promise<QRScannerStatus> {
		this.scanSubscribe.unsubscribe(); // Stop scanning
		this.hideCamera(); // Remove css classes for the transparent background

		return this.qrScanner.destroy(); // Destroy instance
	}

	closeAndGoBack(): void {
		if (this.navCtrl.canGoBack()) {
			this.navCtrl.pop();
		}
	}

	closeAndGoToComponent(component, paramsObject = {}): void {
		this.navCtrl.push(component, paramsObject);
	}

	/**
	 * parse json safely
	 *
	 * @param {any} json should be a string
	 * @return {any} false, undefined, or an object
	 */
	safelyParseJSON(json): any {
		// This function cannot be optimised, it's best to keep it small!
		let parsed;
		try {
			parsed = JSON.parse(json);
		} catch (e) {
			return false;
		}

		return parsed; // Could be undefined!
	}

	whatQrCodeIsIt(): string {
		const scannedAsObject: any = this.safelyParseJSON(this.scanned);

		if (scannedAsObject.qrType && scannedAsObject.qrType !== 'undefined') {
			switch (scannedAsObject.qrType) {
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
		const typeOfQrCode = this.whatQrCodeIsIt();
		if (this.callingComponent && this.callingComponent instanceof CoreLoginCredentialsPage && typeOfQrCode === 'login') {
			return true;

		} else {
			return false;
		}
	}

	presentAlert(): void {
		const alert = this.alertCtrl.create({
			title: 'QR Code not correct',
			message: 'Please try another code generated for this project',
			buttons: [
				{
					text: 'OK',
					role: 'cancel',
					handler: (): void => {
						this.closeAndGoBack();
					}
				}
			]
		});
		alert.present();
	}

	isScanned(): boolean {
		return this.scanned !== '';
	}

	showCamera(): void {
		(window.document.querySelector('ion-app') as HTMLElement).classList.add('cameraView');
	}
	hideCamera(): void {
		(window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');
	}

	/**
	 * test permission for scanner, open camera for qr reader and create subscription for scanned material
	 */
	openQr(): void {
		// Optionally request the permission early
		this.qrScanner.prepare().then((status: QRScannerStatus) => {
			if (status.authorized) {
				// Camera permission was granted

				// Start scanning
				this.scanSubscribe = this.qrScanner.scan().subscribe((text: string) => {
					// Was: this.zone.run(
					// Was:	() => this.scanned = text
					// Was: );

					this.scanned = text;
					if (this.doesQrCodeAndCalledComponentMatch()) {
					// Have to go this curious way with Elementref and trigger click,
					// Cause fire event here in subscription don`t work well (takes very long)
						this.sendbutton.nativeElement.click();
					} else {
						this.presentAlert();
					}

				});

				this.showCamera();
				// Show camera preview
				this.qrScanner.show()
					.then((data: QRScannerStatus) => {
						// Was: console.log('datashowing', data);
					}, (err) => {
						// Was: alert(err);

					});

				// Wait for user to scan something, then the observable callback will be called

			} else if (status.denied) {
				alert('denied');
				// Camera permission was permanently denied
				// You must use QRScanner.openSettings() method to guide the user to the settings page
				// Then they can grant the permission from there
			} else {
				// Permission was denied, but not permanently. You can ask for permission again at a later time.
				alert('else');
			}
		})
		.catch((e: any) => {
			alert('Error is' + e);
    	});
	}

	sendJson(): void {
		if (this.typeOfQrCode === 'login') {
			this.qrReaderProvider.emitLoginData(this.scanned);
		}
	}
}
