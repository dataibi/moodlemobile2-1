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

import { Injectable, EventEmitter } from '@angular/core';

/**
 * This service is for the navigation map.
 */
@Injectable()
export class NavigationMapProvider {

    navigationSectionEvent = new EventEmitter<any>();
    sectionCallEvent = new EventEmitter<any>();
    topicsToSectionIdArray: any[] = [];

    private courseData: any;

    getCourseData(): any {
        return this.courseData;
    }

    setCourseData(courseData: any): void {
        this.courseData = courseData;
    }

    emitnavigationSectionEvent(sectionId: number): void {
        this.navigationSectionEvent.emit(sectionId);
    }

    emitSectionCallEvent(): void {
        this.sectionCallEvent.emit();
    }

    getTopicsToSectionIdArray(): any[] {
        return this.topicsToSectionIdArray;
    }

    setTopicsToSectionIdArray(topicsToSectionIdArray: any[]): void {
        this.topicsToSectionIdArray = topicsToSectionIdArray;
    }
}
