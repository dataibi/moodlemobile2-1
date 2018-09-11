// (C) Copyright 2015 David Pohl
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
import { Component, ViewChild, ElementRef } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { safelyParseJSON } from '../../helpers/navigation_helpers';
import { NavigationMapProvider } from '@providers/navigation-map-provider';

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
	courseData: any;

	constructor(
		public navCtrl: NavController,
		navParams: NavParams,
		private qrScanner: QRScanner,
		private platform: Platform,
		private alertCtrl: AlertController,
		private qrReaderProvider: QrReaderProvider,
		private navigationMapProvider: NavigationMapProvider
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

	closeAndGoToComponent(component: any, paramsObject: any = {}): void {
		this.navCtrl.push(component, paramsObject);
	}

	whatQrCodeIsIt(): string {
		const scannedAsObject: any = safelyParseJSON(this.scanned);

		if (scannedAsObject.qrType && scannedAsObject.qrType !== 'undefined') {
			switch (scannedAsObject.qrType) {
				case 'login':
					this.typeOfQrCode = 'login';
					break;
				case 'section':
					this.typeOfQrCode = 'section';
					break;
				default:
					this.typeOfQrCode = 'unknown';
			}
		} else {
			this.typeOfQrCode = 'unknown';
		}

		return this.typeOfQrCode;
	}

    /**
     * Returns whether the qr code is valid.
     * @return {boolean} whether the qr code is valid
     */
	doesQrCodeAndCalledComponentMatch(): boolean {
		const typeOfQrCode = this.whatQrCodeIsIt();
		if (this.callingComponent && this.callingComponent instanceof CoreLoginCredentialsPage && typeOfQrCode === 'login') {
			return true;
		} else if (typeOfQrCode === 'section') {
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

	/**
	 * Only for the transparent background and css
	 * @return {void}
	 */
	showCamera(): void {
		(window.document.querySelector('ion-app') as HTMLElement).classList.add('cameraView');
	}

	/**
	 * Only for the transparent background and css
	 * @return {void}
	 */
	hideCamera(): void {
		(window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');
	}

	/**
	 * Test permission for scanner, open camera for qr reader and create subscription for scanned material
	 * @return {void}
	 */
	openQr(): void {
		// Optionally request the permission early
		this.qrScanner.prepare().then((status: QRScannerStatus) => {
			if (status.authorized) {
				// Camera permission was granted

				// Start scanning
				this.scanSubscribe = this.qrScanner.scan().subscribe((text: string) => {

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
				this.qrScanner.show();

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

    /**
     * Sends the qr reader readed data to the components or emits the event to emit data.
     *
     * @return {void}
     */
	sendJson(): void {
		let data: any, currentPageIndex: number, topicsToSectionIdArray: any[], foundTopicAndSectionId: any;
		if (this.typeOfQrCode === 'login') {
			this.qrReaderProvider.emitLoginData(this.scanned);
		} else if (this.typeOfQrCode === 'section') {
			data = safelyParseJSON(this.scanned);
			topicsToSectionIdArray = this.navigationMapProvider.getTopicsToSectionIdArray();
			foundTopicAndSectionId = topicsToSectionIdArray.find((topic) => {
				if (data.exhibit.map && typeof data.exhibit.map !== 'undefined') {
						if (data.exhibit.map !== topic.jsonString.map) {
								return false;
						}
				}
				if (data.exhibit.room === topic.jsonString.room &&
					data.exhibit.exponat === topic.jsonString.exponat) {
						return true;
				}
			});
			currentPageIndex = this.navCtrl.getActive().index;
			if (foundTopicAndSectionId !== undefined) {
				this.navigationMapProvider.emitnavigationSectionEvent(foundTopicAndSectionId.sectionId);
			}

			this.navCtrl.remove(1, (currentPageIndex - 2));
			this.navCtrl.pop();
		}
	}
}
