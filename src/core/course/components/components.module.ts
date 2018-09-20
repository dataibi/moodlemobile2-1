import { NavigationMapWrapperPage } from './nav-map-wrapper/nav-map-wrapper';
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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { CoreComponentsModule } from '@components/components.module';
import { CoreDirectivesModule } from '@directives/directives.module';
import { CoreCourseFormatComponent } from './format/format';
import { CoreCourseModuleComponent } from './module/module';
import { CoreCourseModuleCompletionComponent } from './module-completion/module-completion';
import { CoreCourseModuleDescriptionComponent } from './module-description/module-description';
import { CoreCourseUnsupportedModuleComponent } from './unsupported-module/unsupported-module';
import { CorePipesModule } from './../../../pipes/pipes.module';
import { NavigationFloorsPage } from './navigation-floors/navigation-floors';
import { NavigationObjectsPage } from './navigation-objects/navigation-objects';
import { NavigationMapComponent } from './navigation-map/navigation-map';

@NgModule({
    declarations: [
        CoreCourseFormatComponent,
        CoreCourseModuleComponent,
        CoreCourseModuleCompletionComponent,
        CoreCourseModuleDescriptionComponent,
        CoreCourseUnsupportedModuleComponent,
        NavigationMapComponent,
        NavigationObjectsPage,
        NavigationFloorsPage,
        NavigationMapWrapperPage
    ],
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule.forChild(),
        CoreComponentsModule,
        CoreDirectivesModule,
        CorePipesModule
    ],
    providers: [
    ],
    exports: [
        CoreCourseFormatComponent,
        CoreCourseModuleComponent,
        CoreCourseModuleCompletionComponent,
        CoreCourseModuleDescriptionComponent,
        CoreCourseUnsupportedModuleComponent
    ],
    entryComponents: [
        CoreCourseUnsupportedModuleComponent,
        NavigationMapComponent,
        NavigationObjectsPage,
        NavigationFloorsPage,
        NavigationMapWrapperPage
    ]
})
export class CoreCourseComponentsModule {}
