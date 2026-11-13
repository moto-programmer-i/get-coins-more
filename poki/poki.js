import { Platform } from "../platform/platform.js";

export class Poki extends Platform {
    async init() {
        await PokiSDK.init().then(() => {
            console.log("Poki SDK successfully initialized");
            // fire your function to continue to game
        }).catch(() => {
            console.log("Initialized, something went wrong, load your game anyway");
            // fire your function to continue to game
        });
    }

    loadingFinished() {
        PokiSDK.gameLoadingFinished();
    }

    startOfStage() {
        PokiSDK.gameplayStart();
    }

    endOfStage() {
        // PokiのStopはステージ終了時らしい
        // https://developers.poki.com/guide/sdk-html5#3-implement-the-gameplay-events
        PokiSDK.gameplayStop();
    }
    

}