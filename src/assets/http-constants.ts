export abstract class HttpConstants {
    static readonly PLAYER_STORIES_PATH = "/adventure";
    static readonly AUTHOR_STORIES_PATH = "/story";
    static readonly PLAYER_PATH = "/player";
    static readonly GAME_SESSION_PATH = "/game";
    static readonly NEXT_GAME_SESSION_PATH = "/game/next";
    static readonly ACTIVE_PLAYER_SESSION_PATH = "/activePlayerSession";
    static readonly ACTIVE_PLAYER_SESSION_NEXT_PATH = "/activePlayerSession/next";
    static readonly PLAYER_STORIES_PLAYED_PATH: string = "/adventure/played";
    static readonly PLAYER_AUTHORID_PATH: string = "/player/authorId";
    static readonly ACTIVE_GAME_STATE_SESSION_PATH: string = "/activeGameStateSession";
    static readonly LOCATION_PATH: string = "/location";
    static readonly USER_PROFILE: string = "/user-profile";
    static readonly SAVE_GAME_PATH = "/save-game";
    static readonly ADMIN_STORY: string = "/admin/story/all";
    static readonly DISPLAY_PATH: string = "/display";
    static readonly ADVENTURE_MAP_PATH: string = "/adventure-map";
}