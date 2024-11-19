const { default: OBSWebSocketNew } = require("obs-websocket-js");
const OBSWebSocketOld = require("obs-websocket-js-27"); // npm i obs-websocket-js-27@npm:obs-websocket-js@4.0.3

const utilsModule = require("../utils/utilsModule");

const connections = {
  localAlveus: {
    name: "AlveusServer",
    address: process.env.OBS_WS,
    password: process.env.OBS_KEY,
  },
  localNuthouse: {
    name: "NuthouseServer",
    address: process.env.OBS_WS_NUTHOUSE,
    password: process.env.OBS_KEY_NUTHOUSE,
  },
  localTest: {
    name: "TestServer",
    address: process.env.OBS_WS_TEST,
    password: process.env.OBS_KEY_TEST,
  },
  cloudAlveus: {
    name: "CloudAlveusServer",
    address: process.env.OBS_WS_ALVEUS_CLOUD,
    password: process.env.OBS_KEY_ALVEUS_CLOUD,
    old: true,
  },
  cloudMaya: {
    name: "CloudMayaServer",
    address: process.env.OBS_WS_MAYA_CLOUD,
    password: process.env.OBS_KEY_MAYA_CLOUD,
    old: true,
  },
  cloudSpace: {
    name: "CloudSpaceServer",
    address: process.env.OBS_WS_SPACE_CLOUD,
    password: process.env.OBS_KEY_SPACE_CLOUD,
  },
};

/**
 * OBS Websocket Class
 *
 * https://github.com/obsproject/obs-websocket/blob/master/docs/generated/protocol.md
 * https://github.com/obsproject/obs-websocket/blob/4.x-compat/docs/generated/protocol.md#table-of-contents
 */
class OBS {
  client = null;
  name = null;
  ipAddress = null;
  password = null;
  studioMode = null;
  transitioning = false;
  currentScene = null;
  isStreaming = null;
  sceneList = [];
  retryAmount = 99999999;
  retryCounter = 0;
  retryTimeout = 250;
  maxTimeout = 30000;
  utils = null;
  connected = false;
  enableReconnect = true;

  constructor(name, ipAddress, password, oldWS) {
    this.name = name;
    let utilsName = "";
    if (name == null || name == "") {
      utilsName = `OBSModule`;
    } else {
      utilsName = `OBS Module(${name})` || `OBSModule`;
    }
    this.ipAddress = ipAddress;
    this.password = password;
    this.oldWS = oldWS;
    // this.utils.setPrefix(`[${this.name}]`);
    this.utils = new utilsModule(`[${utilsName}]`);
  }

  async createClient() {
    const self = this;
    try {
      self.client = this.oldWS ? new OBSWebSocketOld() : new OBSWebSocketNew();

      if (self.oldWS) {
        self.client.on("StudioModeSwitched", (event) => {
          self.utils.log(`StudioModeSwitched: ${JSON.stringify(event)}`);
          self.studioMode = event["new-state"];
        });
        self.client.on("TransitionBegin", (event) => {
          //self.utils.log(`SceneTransitionStarted: ${JSON.stringify(event)}`);
          self.transitioning = true;
        });
        self.client.on("SwitchScenes", (event) => {
          // self.utils.log(`SceneNameChanged: ${JSON.stringify(event)}`);
          // let oldName = event.oldSceneName;
          // let newName = event.sceneName;
          self.getCurrentSceneList();
        });
        self.client.on("SceneCollectionChanged", (event) => {
          //self.utils.log(`CurrentSceneCollectionChanged: ${JSON.stringify(event)}`);
          // let newCollectionName = event.sceneCollectionName;
          self.getCurrentSceneList();
        });
        self.client.on("StreamStarted", (event) => {
          //self.utils.log(`StreamStateChanged: ${JSON.stringify(event)}`);
          // let newCollectionName = event.sceneCollectionName;
          self.isStreaming = true;
        });
        self.client.on("StreamStopped", (event) => {
          //self.utils.log(`StreamStateChanged: ${JSON.stringify(event)}`);
          // let newCollectionName = event.sceneCollectionName;
          self.isStreaming = false;
        });
        self.client.on("AuthenticationSuccess", (event) => {
          self.utils.log(`AuthenticationSuccess`);
          self.connected = true;
          self.retryTimeout = 250;
          self.retryCounter = 0;
          self.getCurrentSceneList();
          self.fetchStudioMode();
          self.fetchStreamStatus();
        });
        self.client.on("AuthenticationFailure", (error) => {
          self.connected = false;
          self.utils.log(`AuthenticationFailure: ${error}`);
          self.client.disconnect();
          self.reconnect();
        });
        self.client.on("ConnectionOpened", () => {
          //self.utils.log(`ConnectionOpened`);
        });
        self.client.on("ConnectionClosed", (error) => {
          self.connected = false;
          self.utils.log(`ConnectionClosed: ${error}`);
          self.reconnect();
        });
        self.client.on("ConnectionError", (error) => {
          self.utils.log(`ConnectionError: ${error}`);
          self.client.disconnect();
        });
      } else {
        self.client.on("CurrentProgramSceneChanged", (event) => {
          //used in client.scenechange();
          //self.utils.log(`CurrentProgramSceneChanged: ${JSON.stringify(event)}`);
        });
        self.client.on("CurrentPreviewSceneChanged", (event) => {
          //self.utils.log(`CurrentPreviewSceneChanged: ${JSON.stringify(event)}`);
        });
        self.client.on("StudioModeStateChanged", (event) => {
          //self.utils.log(`StudioModeStateChanged: ${JSON.stringify(event)}`);
          self.studioMode = event.studioModeEnabled;
        });
        self.client.on("SceneTransitionStarted", (event) => {
          //self.utils.log(`SceneTransitionStarted: ${JSON.stringify(event)}`);
          self.transitioning = true;
        });
        self.client.on("SceneTransitionVideoEnded", (event) => {
          //self.utils.log(`SceneTransitionVideoEnded: ${JSON.stringify(event)}`);
          //self.transitioning = false;
        });
        self.client.on("SceneNameChanged", (event) => {
          //self.utils.log(`SceneNameChanged: ${JSON.stringify(event)}`);
          // let oldName = event.oldSceneName;
          // let newName = event.sceneName;
          self.getCurrentSceneList();
        });
        self.client.on("CurrentSceneCollectionChanged", (event) => {
          //self.utils.log(`CurrentSceneCollectionChanged: ${JSON.stringify(event)}`);
          // let newCollectionName = event.sceneCollectionName;
          self.getCurrentSceneList();
        });
        self.client.on("InputCreated", (event) => {
          //self.utils.log(`InputCreated: ${JSON.stringify(event)}`);
          // let name = event.inputName;
          // let type = event.inputKind;
          // let settings = event.inputSettings;
          // self.getCurrentSceneList();
        });
        self.client.on("SceneItemCreated", (event) => {
          //self.utils.log(`SceneItemCreated: ${JSON.stringify(event)}`);
          // let sceneName = event.sceneName;
          // let sourceName = event.sourceName;
          // let sceneItemId = event.sceneItemId;
          // let sceneItemIndex = event.sceneItemIndex;
          self.getCurrentSceneList();
        });
        self.client.on("SceneItemRemoved", (event) => {
          //self.utils.log(`SceneItemRemoved: ${JSON.stringify(event)}`);
          // let sceneName = event.sceneName;
          // let sourceName = event.sourceName;
          // let sceneItemId = event.sceneItemId;
          self.getCurrentSceneList();
        });
        self.client.on("SceneItemListReindexed", (event) => {
          //self.utils.log(`SceneItemListReindexed: ${JSON.stringify(event)}`);
          // let sceneName = event.sceneName;
          // let sceneItems = event.sceneItems; //array of scene item objects
          self.getCurrentSceneList();
        });
        self.client.on("SceneItemEnableStateChanged", (event) => {
          //self.utils.log(`SceneItemEnableStateChanged: ${JSON.stringify(event)}`);
          // let sceneName = event.sceneName;
          // let sceneItemId = event.sceneItemId;
          // let sceneItemEnabled = event.sceneItemEnabled;
          self.getCurrentSceneList();
        });
        self.client.on("SceneItemLockStateChanged", (event) => {
          //self.utils.log(`SceneItemLockStateChanged: ${JSON.stringify(event)}`);
          // let sceneName = event.sceneName;
          // let sceneItemId = event.sceneItemId;
          // let sceneItemLocked = event.sceneItemLocked;
          self.getCurrentSceneList();
        });
        self.client.on("SceneItemTransformChanged", (event) => {
          //self.utils.log(`SceneItemTransformChanged: ${JSON.stringify(event)}`);
          // let sceneName = event.sceneName;
          // let sceneItemId = event.sceneItemId;
          // let sceneItemTransform = event.sceneItemTransform;
          self.getCurrentSceneList();
        });
        self.client.on("StreamStateChanged", (event) => {
          //self.utils.log(`StreamStateChanged: ${JSON.stringify(event)}`);
          // let newCollectionName = event.sceneCollectionName;
          self.isStreaming = event.outputActive;
        });

        self.client.on("ConnectionOpened", () => {
          self.utils.log(`ConnectionOpened`);
        });
        self.client.on("ConnectionClosed", (error) => {
          self.connected = false;
          self.utils.log(`ConnectionClosed: ${error}`);
          self.reconnect();
        });
        self.client.on("ConnectionError", (error) => {
          self.utils.log(`ConnectionError: ${error}`);
          self.client.disconnect();
        });
        self.client.on("Identified", (data) => {
          //data.negotiatedRpcVersion
          self.utils.log(`Connected and Identified: ${JSON.stringify(data)}`);
          self.connected = true;
          self.retryTimeout = 250;
          self.retryCounter = 0;
          self.getCurrentSceneList();
          self.fetchStudioMode();
          self.fetchStreamStatus();
        });
      }
      self.connect();
    } catch (e) {
      self.utils.log(`Error creating client: ${JSON.stringify(e)}`);
      //throw `Error creating client: ${e}`;
    }
    return this.client;
  }
  async isConnected() {
    return this.connected;
  }
  async disconnect() {
    this.setAutoReconnect(false);
    this.client.disconnect();
  }
  async connect() {
    try {
      let connectInfo = null;
      if (this.oldWS) {
        if (this.password == null || this.password == "") {
          connectInfo = await this.client.connect({
            address: this.ipAddress,
            password: "",
          });
        } else {
          connectInfo = await this.client.connect({
            address: this.ipAddress,
            password: this.password,
          });
        }
      } else {
        if (this.password == null || this.password == "") {
          connectInfo = await this.client.connect(this.ipAddress);
        } else {
          connectInfo = await this.client.connect(
            this.ipAddress,
            this.password,
          );
        }
      }
      return connectInfo;
    } catch (e) {
      //this.utils.log(`Error Connecting: ${JSON.stringify(e)}`);
      return null;
    }
  }
  reconnect() {
    if (!this.enableReconnect) {
      return;
    }
    if (this.retryCounter <= this.retryAmount) {
      this.utils.log(
        `Retrying to connect attempt: ${this.retryCounter} - ${this.retryTimeout}ms`,
      );
      let length = this.retryTimeout + this.retryTimeout;
      if (length > this.maxTimeout) {
        this.retryTimeout = this.maxTimeout;
      } else {
        this.retryTimeout = length;
      }
      setTimeout(this.connect.bind(this), length);
      this.retryCounter++;
    }
  }
  setAutoReconnect(boolean) {
    this.utils.log(`Set Auto Reconnect: ${boolean}`);
    if (boolean == true) {
      this.enableReconnect = true;
      //reconnect if not connected
      if (!this.connected) {
        this.reconnect();
      }
    } else {
      this.enableReconnect = false;
    }
  }
  async startStream() {
    try {
      let response = null;
      if (this.oldWS) {
        response = await this.client.send("StartStreaming");
      } else {
        response = await this.client.call("StartStream");
      }
      this.utils.log(`Start Stream): ${JSON.stringify(response)}`);
      return true;
    } catch (e) {
      this.utils.log(`Error Starting Stream: ${JSON.stringify(e)}`);
      return null;
    }
  }
  async stopStream() {
    try {
      let response = null;
      if (this.oldWS) {
        response = await this.client.send("StopStreaming");
      } else {
        response = await this.client.call("StopStream");
      }
      this.utils.log(`Stop Stream): ${JSON.stringify(response)}`);
      return true;
    } catch (e) {
      this.utils.log(`Error Stopping Stream: ${JSON.stringify(e)}`);
      return null;
    }
  }
  sceneChange(func) {
    let self = this;
    self.client.on("CurrentProgramSceneChanged", (event) => {
      let oldSceneName = self.currentScene;
      //event.sceneName
      // If in studio mode, do not notify of scene change unless transition button used
      // console.log("scenechange",event,self.studioMode,self.transitioning);
      if (self.studioMode) {
        if (self.transitioning) {
          //manual transition, actual scene change
          self.currentScene = event.sceneName;
          self.getCurrentSceneList();
          func(event.sceneName, oldSceneName);
          // console.log("Real Scene Change",event.sceneName);
        }
        //do nothing
      } else {
        // console.log("Real Scene Change",event.sceneName);
        self.currentScene = event.sceneName;
        self.getCurrentSceneList();
        func(event.sceneName, oldSceneName);
      }
      self.transitioning = false;
    });
  }
  async fetchStudioMode() {
    try {
      let response = null;
      if (this.oldWS) {
        response = await this.client.send("GetStudioModeStatus");
        // this.utils.log(`Current Studio Mode: ${JSON.stringify(response)}`);
        if (response && response["studio-mode"] !== null) {
          this.studioMode = response["studio-mode"];
          return response["studio-mode"];
        } else if (response == null) {
          return null;
        }
      } else {
        response = await this.client.call("GetStudioModeEnabled");
        // this.utils.log(`Current Studio Mode: ${JSON.stringify(response)}`);
        if (response && response.studioModeEnabled !== null) {
          this.studioMode = response.studioModeEnabled;
          return response.studioModeEnabled;
        } else if (response == null) {
          return null;
        }
      }
    } catch (e) {
      this.utils.log(`Error Getting Studio Mode: ${JSON.stringify(e)}`);
      return null;
    }
  }
  async isStudioMode() {
    if (this.studioMode == null) {
      return await this.fetchStudioMode();
    } else {
      return this.studioMode;
    }
  }
  async fetchCurrentScene() {
    try {
      let response = null;
      if (this.oldWS) {
        response = await this.client.send("GetCurrentScene");
        // this.utils.log(`Current Scene: ${JSON.stringify(response.name)}`);
        if (response && response.name !== null) {
          this.currentScene = response.name;
          return response.name;
        } else if (response == null) {
          return null;
        }
      } else {
        response = await this.client.call("GetCurrentProgramScene");
        // this.utils.log(`Current Scene: ${JSON.stringify(response)}`);
        if (response && response.currentProgramSceneName !== null) {
          this.currentScene = response.currentProgramSceneName;
          return response.currentProgramSceneName;
        } else if (response == null) {
          return null;
        }
      }
    } catch (e) {
      this.utils.log(`Error Getting Current Scene: ${JSON.stringify(e)}`);
      return null;
    }
  }
  async getScene() {
    if (this.currentScene == null) {
      return await this.fetchCurrentScene();
    } else {
      return this.currentScene;
    }
  }
  async isLive() {
    if (this.currentScene == null) {
      return await this.fetchStreamStatus();
    } else {
      return this.isStreaming;
    }
  }
  async fetchStreamStatus() {
    //https://github.com/obsproject/obs-websocket/blob/master/docs/generated/protocol.md#getstreamstatus
    try {
      let response = null;
      if (this.oldWS) {
        response = await this.client.send("GetStreamingStatus");
        this.utils.log(`Stream Status: ${JSON.stringify(response)}`);
        if (response && response.streaming !== null) {
          this.isStreaming = response.streaming;
          return response.streaming;
        } else if (response == null) {
          return null;
        }
      } else {
        response = await this.client.call("GetStreamStatus");
        this.utils.log(`Stream Status: ${JSON.stringify(response)}`);
        if (response && response.outputActive !== null) {
          this.isStreaming = response.outputActive;
          return response.outputActive;
        } else if (response == null) {
          return null;
        }
      }
    } catch (e) {
      this.utils.log(`Error Getting Stream Status: ${JSON.stringify(e)}`);
      return null;
    }
  }
  async restartSource(sourceName) {
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PLAY
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PAUSE
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_RESTART
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_NEXT
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PREVIOUS
    let param = {
      inputName: sourceName,
      mediaAction: "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_RESTART",
    };
    try {
      let response = null;
      if (this.oldWS) {
        response = await this.client.send("RestartMedia", {
          sourceName: sourceName,
        });
      } else {
        response = await this.client.call("TriggerMediaInputAction", param);
      }
      this.utils.log(
        `Restart Source (${sourceName}): ${JSON.stringify(response)}`,
      );
      return true;
    } catch (e) {
      this.utils.log(
        `Error Restarting Source (${sourceName}): ${JSON.stringify(e)}`,
      );
      return null;
    }
  }
  async nextMediaSource(sourceName) {
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PLAY
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PAUSE
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_RESTART
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_NEXT
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PREVIOUS
    let param = {
      inputName: sourceName,
      mediaAction: "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_NEXT",
    };
    try {
      let response = null;
      if (this.oldWS) {
        // response = await this.client.send("nextMediaSource", {
        // 	sourceName: sourceName,
        // });
      } else {
        response = await this.client.call("TriggerMediaInputAction", param);
      }
      this.utils.log(
        `nextMediaSource(${sourceName}): ${JSON.stringify(response)}`,
      );
      return true;
    } catch (e) {
      this.utils.log(
        `Error nextMediaSource (${sourceName}): ${JSON.stringify(e)}`,
      );
      return null;
    }
  }
  async prevMediaSource(sourceName) {
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PLAY
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PAUSE
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_RESTART
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_NEXT
    //OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PREVIOUS
    let param = {
      inputName: sourceName,
      mediaAction: "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PREVIOUS",
    };
    try {
      let response = null;
      if (this.oldWS) {
        // response = await this.client.send("prevMediaSource", {
        // 	sourceName: sourceName,setScene(
        // });
      } else {
        response = await this.client.call("TriggerMediaInputAction", param);
      }
      this.utils.log(
        `prevMediaSource(${sourceName}): ${JSON.stringify(response)}`,
      );
      return true;
    } catch (e) {
      this.utils.log(
        `Error prevMediaSource (${sourceName}): ${JSON.stringify(e)}`,
      );
      return null;
    }
  }
  async setScene(sceneName) {
    let self = this;
    let param = { sceneName: sceneName };
    try {
      let response = null;
      if (self.oldWS) {
        response = await self.client.send("SetCurrentScene", {
          "scene-name": sceneName,
        });
      } else {
        response = await self.client.call("SetCurrentProgramScene", param);
      }
      //no result
      self.utils.log(`Set Scene: ${sceneName}`);
      return true;
    } catch (e) {
      self.utils.log(
        `Error Setting Scene (${sceneName}): ${JSON.stringify(e)}`,
      );
      return null;
    }
  }
  async restartSceneItem(sceneName, sourceName) {
    let self = this;
    try {
      if (self.oldWS) {
        //old version
        let params = {
          "scene-name": sceneName,
          item: sourceName,
          visible: false,
        };
        let response = await self.client.send("SetSceneItemProperties", params);
        setTimeout(async () => {
          params.visible = true;
          await self.client.send("SetSceneItemProperties", params);
        }, 2000);
        return true;
      } else {
        let param = {
          sceneName: sceneName,
          sourceName: sourceName,
        };
        let item = await self.findSceneItem(sceneName, sourceName);
        //sceneItemEnabled: true,  sceneItemId: 3,  sceneItemIndex: 0, sourceName: 'Georgie Name',
        //sourceType: 'OBS_SOURCE_TYPE_INPUT',  groupName: 'test2',  searchTerm: 'georgie',  sceneName: 'test
        self.utils.log(
          `restartSceneItem (${sceneName},${sourceName}): ${item.sceneItemId} ${item.sceneItemEnabled}`,
        );
        if (!item.sceneItemEnabled) {
          //dont reset if its already off
          return false;
        }
        if (item.groupName) {
          //use group name if found under a group
          param.sceneName = item.groupName;
        } else {
          param.sceneName = item.sceneName;
        }
        param.sourceName = item.sourceName;
        param.sceneItemId = item.sceneItemId;
        param.sceneItemEnabled = false;
        await self.client.call("SetSceneItemEnabled", param);
        setTimeout(async () => {
          param.sceneItemEnabled = true;
          await self.client.call("SetSceneItemEnabled", param);
        }, 2000);
        return true;
      }
    } catch (e) {
      self.utils.log(
        `Error restartSceneItem (${sceneName},${sourceName}): ${JSON.stringify(
          e,
        )}`,
      );
      return null;
    }
  }
  async setSourceNetworkCache(sourceName, networkCacheAmount) {
    //for VLC sources
    let self = this;
    try {
      let response = null;
      if (self.oldWS) {
        //old version
        response = await self.client.send("SetSourceSettings", {
          sourceName: sourceName,
          //sourceType:"vlc_source", //media: ffmpeg_source
          sourceSettings: { network_caching: networkCacheAmount },
        });
      } else {
        //new version
        response = await self.client.call("SetInputSettings", {
          inputName: sourceName,
          overlay: true,
          inputSettings: { network_caching: networkCacheAmount },
        });
      }
      return response;
    } catch (e) {
      self.utils.log(
        `Error setSourceNetworkCache (${sourceName},${networkCacheAmount}): ${JSON.stringify(
          e,
        )}`,
      );
      return null;
    }
  }
  async toggleMute(sourceName) {
    let self = this;
    let param = { inputName: sourceName };
    try {
      let response = null;
      if (self.oldWS) {
        response = await self.client.send("ToggleMute", {
          source: sourceName,
        });
      } else {
        response = await self.client.call("ToggleInputMute", param);
      }
      //no result
      self.utils.log(`Toggle Mute: ${sourceName}`);
      return true;
    } catch (e) {
      self.utils.log(`Error Toggle Mute (${sourceName}): ${JSON.stringify(e)}`);
      return null;
    }
  }
  async getMute(sourceName) {
		let self = this;
		let param = { inputName: sourceName };
		try {
			let response = null;
			if (self.oldWS) {
				response = await self.client.send("getMute", {"source": sourceName});
			} else {
				response = await self.client.call("GetInputMute", param);
			}
			let booleanStatus = response?.inputMuted ?? null;
			self.utils.log(`Get Mute: ${sourceName}-`,response);
			return booleanStatus;
		} catch (e) {
			self.utils.log(`Error Get Mute (${sourceName}}): ${JSON.stringify(e)}`);
			return null;
		}
	}
  async setMute(sourceName, booleanStatus) {
    let self = this;
    let param = { inputName: sourceName, inputMuted: booleanStatus };
    try {
      let response = null;
      if (self.oldWS) {
        response = await self.client.send("SetMute", {
          source: sourceName,
          mute: booleanStatus,
        });
      } else {
        response = await self.client.call("SetInputMute", param);
      }
      //no result
      self.utils.log(`Set Mute: ${sourceName}-${booleanStatus}`);
      return true;
    } catch (e) {
      self.utils.log(
        `Error Set Mute (${sourceName}-${booleanStatus}): ${JSON.stringify(e)}`,
      );
      return null;
    }
  }
  async setInputVolume(sourceName, inputVolumeDb) {
    let self = this;
    //inputVolumeDb >= -100, <= 26
    //inputVolumeMul >= 0, <= 20
    let param = { inputName: sourceName, inputVolumeDb: inputVolumeDb };
    try {
      let response = null;
      if (self.oldWS) {
        // response = await self.client.send("SetMute", {
        // 	"source": sourceName,
        // 	"mute":booleanStatus
        // });
      } else {
        response = await self.client.call("SetInputVolume", param);
      }
      //no result
      self.utils.log(`SetInputVolume: ${sourceName}-${inputVolumeDb}`);
      return true;
    } catch (e) {
      self.utils.log(
        `Error SetInputVolume (${sourceName}-${inputVolumeDb}): ${JSON.stringify(
          e,
        )}`,
      );
      return null;
    }
  }
  async getInputVolume(sourceName) {
		let self = this;
		//inputVolumeDb >= -100, <= 26
		//inputVolumeMul >= 0, <= 20
		let param = { inputName: sourceName };
		try {
			let response = null;
			if (self.oldWS) {
				// response = await self.client.send("SetMute", {
				// 	"source": sourceName,
				// 	"mute":booleanStatus
				// });
			} else {
				response = await self.client.call("GetInputVolume", param);
			}
			let dbVolume = response.inputVolumeDb;
			self.utils.log(`GetInputVolume: ${sourceName}-`,response);
			return dbVolume;
		} catch (e) {
			self.utils.log(`Error GetInputVolume (${sourceName}): ${JSON.stringify(e)}`);
			return null;
		}
	}
  async getInputSettings(sourceName) {
    let self = this;
    let param = { inputName: sourceName };
    try {
      let response = null;
      if (self.oldWS) {
        self.utils.log(`Old OBS Not Setup`);
        return null;
      } else {
        response = await self.client.call("GetInputSettings", param);
      }
      //no result
      self.utils.log(`getInputSettings: ${sourceName}`, response);
      return response;
    } catch (e) {
      self.utils.log(
        `Error getInputSettings (${sourceName}): ${JSON.stringify(e)}`,
      );
      return null;
    }
  }
  async findSceneItem(sceneName, sourceName) {
    let self = this;
    try {
      let sceneList = await self.getSceneItemList(sceneName);
      let item = null;
      //find exact name match
      for (let scene of sceneList) {
        if (scene.sourceName == sourceName) {
          item = scene;
          item.sceneName = sceneName;
          break;
        }
      }
      if (item == null) {
        //try and find closest match
        let cleanName = sourceName.toLowerCase().trim();
        for (let scene of sceneList) {
          let name = scene.sourceName;
          if (name.toLowerCase().trim().includes(cleanName)) {
            item = scene;
            item.searchTerm = sourceName;
            item.sceneName = sceneName;
            break;
          }
        }
      }
      //no result
      self.utils.log(
        `findSceneItem: ${sceneName}-${sourceName}`,
        item.sceneItemId,
      );
      return item;
    } catch (e) {
      self.utils.log(
        `Error findSceneItem (${sceneName}-${sourceName}): ${JSON.stringify(
          e,
        )}`,
      );
      return null;
    }
  }
  async getSceneItemId(sceneName, sourceName) {
    let self = this;
    try {
      let sceneList = await self.getSceneItemList(sceneName);
      let id = null;
      //find exact name match
      for (let scene of sceneList) {
        if (scene.sourceName == sourceName) {
          id = scene.sceneItemId;
          break;
        }
      }
      if (id == null) {
        //try and find closest match
        let cleanName = sourceName.toLowerCase().trim();
        for (let scene of sceneList) {
          let name = scene.sourceName;
          if (name.toLowerCase().trim().includes(cleanName)) {
            id = scene.sceneItemId;
            break;
          }
        }
      }
      //no result
      self.utils.log(`getSceneItemId: ${sceneName}-${sourceName}`, id);
      return id;
    } catch (e) {
      self.utils.log(
        `Error getSceneItemId (${sceneName}-${sourceName}): ${JSON.stringify(
          e,
        )}`,
      );
      return null;
    }
  }
  async getSceneItemIdExact(sceneName, sourceName) {
    let self = this;
    let param = {
      sceneName: sceneName,
      sourceName: sourceName,
    };
    try {
      let response = null;
      if (self.oldWS) {
        self.utils.log(`Old OBS Not Setup`);
        return null;
      } else {
        response = await self.client.call("GetSceneItemId", param);
      }
      //no result
      self.utils.log(`getSceneItemId: ${sceneName}-${sourceName}`, response);
      return response.sceneItemId;
    } catch (e) {
      self.utils.log(
        `Error getSceneItemId (${sceneName}-${sourceName}): ${JSON.stringify(
          e,
        )}`,
      );
      return null;
    }
  }
  async getSceneItemTransform(sceneName, sourceName) {
    let self = this;
    try {
      if (self.oldWS) {
        self.utils.log(`Old OBS Not Setup`);
        return null;
      } else {
        let sceneItemId = await self.getSceneItemId(sceneName, sourceName);
        let param = {
          sceneName: sceneName,
          sceneItemId: sceneItemId,
        };
        let responseTransform = await self.client.call(
          "GetSceneItemTransform",
          param,
        );
        self.utils.log(
          `getSceneItemTransform (${sceneName},${sourceName},${sceneItemId}): ${responseTransform}`,
        );
        return responseTransform;
      }
    } catch (e) {
      self.utils.log(
        `Error getSceneItemTransform (${sceneName},${sourceName},${sceneItemId}): ${JSON.stringify(
          e,
        )}`,
      );
      return null;
    }
  }
  async setSceneItemTransform(sceneName, sourceName, transform) {
    let self = this;
    try {
      if (self.oldWS) {
        self.utils.log(`Old OBS Not Setup`);
        return null;
      } else {
        let sceneItemId = await self.getSceneItemId(sceneName, sourceName);
        let param = {
          sceneName: sceneName,
          sceneItemId: sceneItemId,
          sceneItemTransform: transform,
        };
        let responseTransform = await self.client.call(
          "SetSceneItemTransform",
          param,
        );
        self.utils.log(
          `SetSceneItemTransform (${sceneName},${sourceName},${sceneItemId}): ${JSON.stringify(
            transform,
          )}`,
        );
        return responseTransform;
      }
    } catch (e) {
      self.utils.log(
        `Error SetSceneItemTransform (${sceneName},${sourceName},${sceneItemId}): ${JSON.stringify(
          e,
        )}`,
      );
      return null;
    }
  }
  async setSceneItemIdTransform(sceneName, sceneItemId, transform) {
    let self = this;
    try {
      if (self.oldWS) {
        self.utils.log(`Old OBS Not Setup`);
        return null;
      } else {
        let param = {
          sceneName: sceneName,
          sceneItemId: sceneItemId,
          sceneItemTransform: transform,
        };
        let responseTransform = await self.client.call(
          "SetSceneItemTransform",
          param,
        );
        // self.utils.log(`setSceneItemIdTransform (${sceneName},${sceneItemId}): ${JSON.stringify(transform)}`);
        return responseTransform;
      }
    } catch (e) {
      self.utils.log(
        `Error setSceneItemIdTransform (${sceneName},${sceneItemId}): ${JSON.stringify(
          e,
        )}`,
      );
      return null;
    }
  }
  async getSceneItemList(sceneName) {
    let self = this;
    try {
      if (self.oldWS) {
        self.utils.log(`Old OBS Not Setup`);
        return null;
      } else {
        let param = { sceneName: sceneName };
        let sceneItems = await self.client.call("GetSceneItemList", param);
        sceneItems = sceneItems.sceneItems || sceneItems;
        // self.utils.log(`GetSceneItemList (${sceneName}): ${sceneItems}`);
        // {
        // 	inputKind: null,
        // 	isGroup: false,
        // 	sceneItemBlendMode: 'OBS_BLEND_NORMAL',
        // 	sceneItemEnabled: false,
        // 	sceneItemId: 4,
        // 	sceneItemIndex: 3,
        // 	sceneItemLocked: false,
        // 	sceneItemTransform: [Object],
        // 	sourceName: 'Georgie',
        // 	sourceType: 'OBS_SOURCE_TYPE_SCENE'
        // }
        let allItems = [];
        for (let item of sceneItems) {
          allItems.push(item);
          if (item.isGroup) {
            let name = item.sourceName;
            let groupItems = await self.getGroupItemList(name);
            allItems = allItems.concat(groupItems);
          }
        }
        return allItems;
      }
    } catch (e) {
      self.utils.log(
        `Error GetSceneItemList (${sceneName}): ${JSON.stringify(e)}`,
      );
      return null;
    }
  }
  async getCurrentSceneList() {
    let self = this;
    try {
      if (self.oldWS) {
        self.utils.log(`Old OBS Not Setup`);
        return null;
      } else {
        let currentScene = await self.fetchCurrentScene();
        if (currentScene == null) {
          return null;
        }
        let sceneList = await self.getSceneItemList(currentScene);
        self.sceneList = sceneList;
        return sceneList;
      }
    } catch (e) {
      self.utils.log(
        `Error GetSceneItemList (${sceneName}): ${JSON.stringify(e)}`,
      );
      return null;
    }
  }
  async getGroupItemList(groupName) {
    let self = this;
    try {
      if (self.oldWS) {
        self.utils.log(`Old OBS Not Setup`);
        return null;
      } else {
        let param = { sceneName: groupName };
        let groupItems = await self.client.call("GetGroupSceneItemList", param);
        groupItems = groupItems.sceneItems || groupItems;
        for (let item of groupItems) {
          item.groupName = groupName;
        }
        return groupItems;
      }
    } catch (e) {
      self.utils.log(
        `Error GetGroupSceneItemList (${sceneName}): ${JSON.stringify(e)}`,
      );
      return null;
    }
  }
  async setSceneItemEnabled(sceneName, sourceName, booleanStatus) {
    let self = this;
    try {
      if (self.oldWS) {
        self.utils.log(`Old OBS Not Setup`);
        return null;
      } else {
        let sceneItemId = await self.getSceneItemId(sceneName, sourceName);
        let param = {
          sceneName: sceneName,
          sceneItemId: sceneItemId,
          sceneItemEnabled: booleanStatus,
        };
        let responseTransform = await self.client.call(
          "SetSceneItemEnabled",
          param,
        );
        // self.utils.log(`SetSceneItemEnabled (${sceneName},${sourceName},${sceneItemId}): ${booleanStatus}`);
        return responseTransform;
      }
    } catch (e) {
      self.utils.log(
        `Error SetSceneItemEnabled (${sceneName},${sourceName},${sceneItemId}): ${JSON.stringify(
          e,
        )}`,
      );
      return null;
    }
  }
  async setSceneItemIdEnabled(sceneName, sceneItemId, booleanStatus) {
    let self = this;
    try {
      if (self.oldWS) {
        self.utils.log(`Old OBS Not Setup`);
        return null;
      } else {
        let param = {
          sceneName: sceneName,
          sceneItemId: sceneItemId,
          sceneItemEnabled: booleanStatus,
        };
        let responseTransform = await self.client.call(
          "SetSceneItemEnabled",
          param,
        );
        // self.utils.log(`SetSceneItemEnabled (${sceneName},${sceneItemId}): ${booleanStatus}`);
        return responseTransform;
      }
    } catch (e) {
      self.utils.log(
        `Error SetSceneItemEnabled (${sceneName},${sceneItemId}): ${JSON.stringify(
          e,
        )}`,
      );
      return null;
    }
  }
  async getSceneItemIndex(sceneName, sceneItemId) {
    //index 0 is bottom
    let self = this;
    let param = {
      sceneName: sceneName,
      sceneItemId: sceneItemId,
    };
    try {
      let response = null;
      if (self.oldWS) {
        self.utils.log(`Old OBS Not Setup`);
        return null;
      } else {
        response = await self.client.call("GetSceneItemIndex", param);
      }
      //no result
      self.utils.log(
        `getSceneItemIndex: ${sceneName}-${sceneItemId}`,
        response,
      );
      return response.sceneItemId;
    } catch (e) {
      self.utils.log(
        `Error getSceneItemIndex (${sceneName}-${sceneItemId}): ${JSON.stringify(
          e,
        )}`,
      );
      return null;
    }
  }
  async setSceneItemIndex(sceneName, sceneItemId, sceneItemIndex) {
    //index 0 is bottom
    let self = this;
    try {
      if (self.oldWS) {
        self.utils.log(`Old OBS Not Setup`);
        return null;
      } else {
        let param = {
          sceneName: sceneName,
          sceneItemId: sceneItemId,
          sceneItemIndex: sceneItemIndex,
        };
        let response = await self.client.call("SetSceneItemIndex", param);
        // self.utils.log(`setSceneItemIndex (${sceneName},${sceneItemId}): ${booleanStatus}`);
        return response;
      }
    } catch (e) {
      self.utils.log(
        `Error setSceneItemIndex (${sceneName},${sceneItemId},${sceneItemIndex}): ${JSON.stringify(
          e,
        )}`,
      );
      return null;
    }
  }

  //Order scenelist based on current locations.
  async setSceneOrder(sceneName, order, nameFunction) {
    let self = this;
    try {
      let result = await self.getSceneItemList(sceneName);
      if (nameFunction != null && nameFunction instanceof Function) {
        order.forEach((name, index) => (order[index] = nameFunction(name)));
      }
      if (result == null) {
        return null;
      }
      let orderNums = [];
      let sceneNames = {};
      for (let scene of result) {
        let name = scene.sourceName;
        let id = scene.sceneItemId;
        let enabled = scene.sceneItemEnabled;
        let index = scene.sceneItemIndex;
        let cleanName = name;
        if (nameFunction != null && nameFunction instanceof Function) {
          cleanName = nameFunction(name);
        }
        if (order.includes(cleanName)) {
          orderNums.push(index);
        }
        sceneNames[cleanName] = id;
      }
      orderNums.sort();
      let lastindex = 0;
      let pos = 0;
      for (let i = order.length - 1; i >= 0; i--) {
        let name = order[i];
        let id = sceneNames[name];
        lastindex = orderNums[pos] ?? lastindex;
        pos = pos + 1;
        await self.setSceneItemIndex(sceneName, id, lastindex);
      }
      return true;
    } catch (e) {
      self.utils.log(`Error setSceneOrder (${order}): ${JSON.stringify(e)}`);
      return null;
    }
  }
}

/**
 * Create a new OBS instance
 *
 * @param {keyof typeof connections} connection Connection name to create
 * @returns {Promise<OBS>}
 */
const create = async (connection) => {
  const client = new OBS(
    connections[connection].name,
    connections[connection].address,
    connections[connection].password,
    connections[connection].old,
  );
  await client.createClient();
  return client;
};

/**
 * Establishes websocket connections to the OBS instances
 *
 * `controller.connections.obs.local` is the local OBS instance
 * `controller.connections.obs.cloud` is the cloud OBS instance
 * `controller.connections.obs.create` is a method to create new OBS instances
 *
 * @param {import("../controller")} controller
 * @returns {Promise<void>}
 */
module.exports = async (controller) => {
  const local = process.env.NODE_ENV == 'development' ? await create("localTest") : await create("localAlveus");
  const cloud = process.env.NODE_ENV == 'development' ? await create("localTest") : await create("cloudSpace");

  controller.connections.obs = { local, cloud, create };
};
