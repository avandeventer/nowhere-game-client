import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AdventureMap } from "src/assets/adventure-map";
import { HttpConstants } from "src/assets/http-constants";

import { environment } from "src/environments/environments";

@Injectable({ providedIn: 'root' })
export class AdventureMapService {

    constructor(private http:HttpClient) {}

    public createAdventureMap(
        userProfileId: string,
        adventureMap: AdventureMap,
      ): Observable<AdventureMap> {
        return this.http.post<AdventureMap>(
            environment.nowhereBackendUrl 
                + HttpConstants.USER_PROFILE 
                + "/"
                + userProfileId 
                + HttpConstants.ADVENTURE_MAP_PATH, 
            adventureMap
        );
    }

    public updateAdventureMap(
        userProfileId: string,
        adventureMap: AdventureMap,
      ): Observable<AdventureMap> {
        return this.http.put<AdventureMap>(
            environment.nowhereBackendUrl
                + HttpConstants.USER_PROFILE
                + "/"
                + userProfileId
                + HttpConstants.ADVENTURE_MAP_PATH,
            adventureMap
        );
    }

    public getTraitTypes(): Observable<string[]> {
        return this.http.get<string[]>(
            environment.nowhereBackendUrl + '/trait-types'
        );
    }

    public getLocationImages(): Observable<string[]> {
        return this.http.get<string[]>(
            environment.nowhereBackendUrl + HttpConstants.LOCATION_IMAGES_PATH
        );
    }
}