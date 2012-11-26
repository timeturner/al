/**
 * @license
 * Copyright (C) SayMama Ltd 2012
 *
 * All rights reserved. Any use, copying, modification, distribution and selling
 * of this software and it's documentation for any purposes without authors'
 * written permission is hereby prohibited.
 */
/**
 * @fileoverview
 * @TODO file description
 *
 * @author Tadeusz Kozak
 * @date 28-05-2012 14:39
 */

/**
 * AddLive namespace. Wraps all methods, classes, functions and costs
 * provided by the AddLive SDK.
 *
 * @externs
 * @namespace
 */
var ADL = ADL || {};

(function () {
  'use strict';

  /**
   * @const
   * @private
   * @type {string}
   */
  ADL._UPDATE_DESCRIPTOR_NAME = 'update';

  /**
   * @const
   * @private
   * @type {string}
   */
  var UPDATE_DESCRIPTOR_CONTAINER_ID = 'updateDescrContainer';

  /**
   *
   * List of responders waiting for installer ULRs.
   * @private
   * @type {ADL.Responder}
   */
  var installerURLResponder;

  /**
   * @private
   * @type {Boolean}
   */
  var waitingForUpdateDescriptor = false;

  /**
   *
   * @type {String}
   * @private
   */
  ADL._MIC_CONFIG_KEY = 'adl-mic';

  /**
   *
   * @type {String}
   * @private
   */
  ADL._SPK_CONFIG_KEY = 'adl-spk';

  /**
   *
   * @type {String}
   * @private
   */
  ADL._CAM_CONFIG_KEY = 'adl-cam';

  /**
   * Audio media type tag.
   *
   * @since 1.0.0.0
   * @deprecated since 1.15.0.5 use CDO.MediaType.AUDIO
   * @see ADL.AddLiveService#getProperty
   * @see ADL.AddLiveService#setProperty
   * @see ADL.AddLiveService#publish
   * @see ADL.AddLiveService#unpublish
   * @see ADL.MediaType
   * @const
   * @type {string}
   */
  ADL.MEDIA_TYPE_AUDIO = 'audio';


  /**
   * Video media type tag.
   *
   * @since 1.0.0.0
   * @deprecated since 1.15.0.5 use CDO.MediaType.VIDEO
   * @see ADL.AddLiveService#getProperty
   * @see ADL.AddLiveService#setProperty
   * @see ADL.AddLiveService#publish
   * @see ADL.AddLiveService#unpublish
   * @see ADL.MediaType
   * @const
   * @type {string}
   */
  ADL.MEDIA_TYPE_VIDEO = 'video';

  /**
   * Screen media type tag.
   *
   * @since 1.0.0.0
   * @deprecated since 1.15.0.5 use CDO.MediaType.SCREEN
   * @see ADL.AddLiveService#getProperty
   * @see ADL.AddLiveService#setProperty
   * @see ADL.AddLiveService#publish
   * @see ADL.AddLiveService#unpublish
   * @see ADL.MediaType
   * @const
   * @type {string}
   */
  ADL.MEDIA_TYPE_SCREEN = 'screen';

  /**
   * Enumeration for all possible media connection types.
   *
   * @since 1.15.0.5
   * @const
   * @enum {string}
   * @see ADL.AddLiveServiceListener#onMediaConnTypeChanged
   * @see ADL.MediaConnTypeChangedEvent
   */
  ADL.ConnectionType = {

    /**
     * Indicates that the media transport is not connected at all.
     *
     * @const
     */
    NOT_CONNECTED:'MEDIA_TRANSPORT_TYPE_NOT_CONNECTED',

    /**
     * Media stream is sent/received using RTP/UDP, with help of relay server.
     *
     * @const
     */
    UDP_RELAY:'MEDIA_TRANSPORT_TYPE_UDP_RELAY',

    /**
     *  Media stream is sent/received using RTP/UDP, directly to and from remote
     *  participant.
     *
     *  @const
     */
    UDP_P2P:'MEDIA_TRANSPORT_TYPE_UDP_P2P',

    /**
     * Media stream is sent/received using RTP/TCP, with help of relay server.
     *
     * @const
     */
    TCP_RELAY:'MEDIA_TRANSPORT_TYPE_TCP_RELAY'
  };

  /**
   * Enumeration for all possible media types.
   *
   * @since 1.15.0.5
   * @const
   * @enum {string}
   * @see ADL.AddLiveService#getProperty
   * @see ADL.AddLiveService#setProperty
   * @see ADL.AddLiveService#publish
   * @see ADL.AddLiveService#unpublish
   */
  ADL.MediaType = {

    /**
     * Audio media type tag.
     *
     * @const
     */
    AUDIO:ADL.MEDIA_TYPE_AUDIO,


    /**
     * Video media type tag.
     *
     * @const
     */
    VIDEO:ADL.MEDIA_TYPE_VIDEO,

    /**
     * Screen media type tag.
     *
     * @const
     */
    SCREEN:ADL.MEDIA_TYPE_SCREEN
  };

  /**
   * Enumeration listing all possible levels of AddLive log entries, passed to
   * the log handler, registered using CDO.initLogging
   *
   * @since 1.16.0.0
   * @see ADL.initLogging
   * @enum {string}
   */
  ADL.LogLevel = {

    /**
     * Debug log level - every call to AddLive SDK and results will be reported.
     * Messages of this level are filtered off if the enableDebug argument given
     * to the CDO.initLogging is false.
     */
    DEBUG:'DEBUG',

    /**
     * Warning log level all non fatal problems are reported with this level.
     * Problem here is an event which doesn't affect the platform functionality
     * but may affect its performance.
     */
    WARN:'WARN',

    /**
     * Error log level. Used when reporting all errors encountered by the
     * platform.
     */
    ERROR:'ERROR'
  };


  /**
   * Enumeration containing all possible scaling filter. Used with
   * CDO.renderSink.
   *
   * @since 1.16.0.5
   * @see ADL.renderSink
   * @enum {string}
   */
  ADL.VideoScalingFilter = {

    /**
     * Fast, bilinear scaling algorithm.
     */
    FAST_BILINEAR:'fast_bilinear',

    /**
     * High quality bicubic scaling algorithm.
     */
    BICUBIC:'bicubic'

  };

  /**
   * Initializes default browser-specific logging for the AddLive API.
   *
   * It will try to do a feature detection, to check what are the browsers
   * capabilities, and then will use console object with log/debug, warning, error
   * methods to print CDO logs.
   *
   * @param {boolean} enableDebug
   *          Flag defining whether debugging should be enabled or not.
   */
  ADL.initStdLogging = function (enableDebug) {

    if (enableDebug) {
      _setupStdLogLevel('_logd', 'debug');
      _setupStdLogLevel('_logd', 'log');
    }
    _setupStdLogLevel('_logw', 'warn');
    _setupStdLogLevel('_loge', 'error');
    ADL._logd("Logging initialized");
  };

  /**
   * Initializes logging using user-provided log handler.
   *
   * @example
   *
   * CDOT.initLogging = function () {
   *   CDO.initLogging(function (lev, msg) {
   *     switch (lev) {
   *       case CDO.LogLevel.DEBUG:
   *         CDOT.log.debug("[CDO] " + msg);
   *         break;
   *       case CDO.LogLevel.WARN:
   *         CDOT.log.warn("[CDO] " + msg);
   *         break;
   *       case CDO.LogLevel.ERROR:
   *         CDOT.log.error("[CDO] " + msg);
   *         break;
   *       default:
   *         CDOT.log.error("Got unsupported log level: " + lev + ". Message: " +
   *                        msg);
   *     }
   *   }, false);
   * };
   *
   *
   * @param {Function} logHandler
   *           Function that will receive log entries. It should take two params,
   *           {string} level ("DEBUG", "WARN", "ERROR") and {string} message.
   * @param {boolean=} enableDebug
   *          Flag defining whether debugging should be enabled or not.
   */
  ADL.initLogging = function (logHandler, enableDebug) {
    if (enableDebug) {
      ADL._logd = _wrapLogHandler(logHandler, "DEBUG");
    }
    ADL._logw = _wrapLogHandler(logHandler, "WARN");
    ADL._loge = _wrapLogHandler(logHandler, "ERROR");
    ADL._logd("Logging initialize");
  };

  /**
   * Fetches the internal update descriptor, and parses installer URL specific
   * for user's browser and operating system.
   *
   * @param {ADL.Responder} responder
   *          Responder that will receive the URL
   * @param {string=} updateDescriptorUrl
   *          Custom URL for the update descriptor.
   */
  ADL.getInstallerURL = function (responder, updateDescriptorUrl) {
    try {

      if (waitingForUpdateDescriptor) {
        responder.error(ADL.ErrorCodes.Logic.INVALID_STATE,
                        "getInstallerURL already awaits for update descriptor");
      }
      installerURLResponder = responder;
      if (updateDescriptorUrl === undefined) {
        updateDescriptorUrl =
            ADL._platformOptions.installationDescriptorRoot + // http://complete/path
                ADL._UPDATE_DESCRIPTOR_NAME + // update
                ADL._getUpdateDescriptorSuffix() + '.js';   // .{mac,win}.js
      }
      _loadScript(updateDescriptorUrl, UPDATE_DESCRIPTOR_CONTAINER_ID, true);
    }
    catch (e) {
      responder.error(e.code, e.message);
    }

  };


  /**
   * Renders video sink with given id inside of the container.
   *
   * @since 1.15.0.0
   * @see ADL.VideoScalingFilter
   * @see ADL.AddLiveService.startLocalVideo
   * @see ADL.AddLiveServiceListener.onUserEvent
   * @see ADL.AddLiveServiceListener.onMediaStreamEvent
   * @see ADL.UserStateChangedEvent
   * @param {string|Object} sinkIdOrDescription
   *          Id of sink to render or whole rendering configuration if given as
   *          an object. The object configuration must contain __sinkId__ and
   *          __containerId__ properties. Rest of the parameters expected by
   *          the renderSink method are optional (fullSize, document, mirror,
   *          filterType, windowless).
   * @param {string} [containerId]
   *          Id of DOM node in which the renderer should be placed. Required if
   *          sinkId is given explicitly
   * @param {boolean} [fullSize=true]
   *          Flag defining whether the renderer should take 100% of container
   *          dimensions
   * @param {Document} [document=window.document]
   *          Document in which the renderer should be added. Useful when
   *          injecting the renderer in e.g. popped out window.
   * @param {boolean} [mirror=false]
   *          Flag defining whether the rendered stream should be mirrored or
   *          not.
   * @param {string} [filterType='fast_bilinear']
   *          Filter to be used when scaling the video feed to match the
   *          renderer dimensions.
   * @param {boolean} [windowless=false]
   *          Boolean flag defining whether the renderer should work in windowed
   *          (windowless == false) or windowless mode (windowless == true).
   */
  ADL.renderSink = function (sinkIdOrDescription, containerId, fullSize, document, mirror, filterType, windowless) {
    var sinkId;
    if (arguments.length === 1) {
      //noinspection JSUnresolvedVariable
      sinkId = sinkIdOrDescription.sinkId;
      //noinspection JSUnresolvedVariable
      containerId = sinkIdOrDescription.containerId;
      //noinspection JSUnresolvedVariable
      fullSize = sinkIdOrDescription.fullSize;
      //noinspection JSUnresolvedVariable
      document = sinkIdOrDescription.document;
      //noinspection JSUnresolvedVariable
      mirror = sinkIdOrDescription.mirror;
      //noinspection JSUnresolvedVariable
      filterType = sinkIdOrDescription.filterType;
      //noinspection JSUnresolvedVariable
      windowless = sinkIdOrDescription.windowless;
    } else {
      sinkId = sinkIdOrDescription;
    }
    if (fullSize === undefined) {
      fullSize = true;
    }

    if (document === undefined) {
      document = window.document;
    }
    if (mirror === undefined) {
      mirror = false;
    }
    if (filterType === undefined) {
      filterType = 'fast_bilinear';
    }
    if(windowless === undefined) {
      windowless = true;
    }
    var container = document.getElementById(containerId);
    if (!container) {
      throw new ADL.AddLiveException(
          "Invalid container ID, cannot find DOM node with given id.",
          ADL.ErrorCodes.Logic.LOGIC_INVALID_ARGUMENT
      );
    }
    //noinspection InnerHTMLJS
    container.innerHTML = '';
    //noinspection InnerHTMLJS,StringLiteralBreaksHTMLJS
    container.innerHTML = '<object type="application/x-addliveplugin">' +
        '<param  name="vcamid" value="' + sinkId + '"/>' +
//            Will be undefined and ignored for older API.
        '<param  name="serviceid" value="' + ADL._service.serviceid + '"/>' +
        '<param  name="mirror" value="' + (mirror ? 'true' : 'false') + '"/>' +
        '<param  name="filtertype" value="' + filterType + '"/>' +
        '<param  name="windowless" value="' + (windowless ? 'true' : 'false') + '"/>' +
        '</object>';
    if (container && container.children && container.children[0]) {
      var objectNode = container.children[0];
      if (!objectNode.nodeName) {
        objectNode.nodeName = 'object';
      }
      if (fullSize) {
        objectNode.style.width = '100%';
        objectNode.style.height = '100%';
      }
    }
  };


  /**
   * Exception class thrown by the API.
   *
   * @since 1.15.0.0
   * @param {string} message
   *          Error message
   * @param {Number=} code
   *          Error code
   * @constructor
   */
  ADL.AddLiveException = function (message, code) {

    /**
     * Type of this exception.
     * @const
     * @type {String}
     */
    this.name = 'AddLiveException';

    /**
     * Human-readable error message.
     * @type {String}
     */
    this.message = message;

    /**
     * Error code identifying the problem.
     * @see ADL.ErrorCodes
     * @type {Number}
     */
    this.code = code;
  };

  /*
   * =============================================================================
   * Private methods
   * =============================================================================
   */


  /**
   * Called by the update descriptor JS file.
   * @param descriptor
   * @private
   */
  ADL._updateDescriptorReady = function (descriptor) {
    waitingForUpdateDescriptor = false;
    setTimeout(function () {
      var scriptNode = document.getElementById(UPDATE_DESCRIPTOR_CONTAINER_ID);
      scriptNode.parentNode.removeChild(scriptNode);
    }, 500);
    var ua = window.navigator.userAgent;
    var url = descriptor['url.installer'];
//        ;,
//        failSafeInstallerURL = descriptor['url.installer'];
//    if (/Chrome/.test(ua)) {
//      url = descriptor['url.chromeExtension'];
//    } else if (/Firefox/.test(ua)) {
//      url = descriptor['url.firefoxExtension'];
//    } else if (/MSIE 8|MSIE 9/.test(ua)) {
//      url = descriptor['url.clickOnceInstaller'];
//    } else {
////      Reset the fail safe installer URL - it does not make sense to pass 2
////      same URLs
//      failSafeInstallerURL = undefined;
//    }
    installerURLResponder.result(url);
  };

  /**
   *
   * @return {string}
   * @private
   */
  ADL._getUpdateDescriptorSuffix = function () {
    var ua = window.navigator.userAgent;
    var suffix = false;
    if (/Windows/.test(ua)) {
      suffix = '.win';
    } else if (/(Intel Mac OS X 10_[6-8])|(Intel Mac OS X 10.[6-8])/.test(ua)) {
      suffix = '.mac';
    } else if(/Intel Mac OS X 10_5/.test(ua)) {
      suffix = '.mac105';
    }
    if (suffix) {
      return suffix;
    } else {
      throw new ADL.AddLiveException(
          "Cannot update - platform unsupported",
          ADL.ErrorCodes.Logic.PLATFORM_UNSUPPORTED);
    }
  };

  /**
   * Not-a-function.
   * @private
   */
  ADL._nop = function () {
  };

  /**
   * Logging, debug level handler.
   *
   * @param {string} msg
   *           Message to be logged.
   * @private
   */
  ADL._logd = function (msg) {
  };

  /**
   * Logging, warning level handler.
   *
   * @param {string} msg
   *           Message to be logged.
   * @private
   */
  ADL._logw = function (msg) {
  };

  /**
   * Logging, error level handler.
   *
   * @param {string} msg
   *           Message to be logged.
   * @private
   */
  ADL._loge = function (msg) {
  };

  /**
   *
   * @param key
   * @param value
   * @private
   */
  ADL._setLocalStorageProperty = function (key, value) {
    if (localStorage) {
      localStorage[key] = value;
    }
  };

  /**
   *
   * @param key
   * @param value
   * @private
   */
  ADL._getLocalStorageProperty = function (key) {
    if (localStorage) {
      return localStorage[key];
    } else {
      return undefined;
    }
  };

  /**
   * Wraps user-provided log handler to pass messages with given scope string.
   *
   * @param {Function} handler
   *           Handler to be wrapped.
   * @param {string} level
   *           Logging level to pass.
   * @return {Function}
   *           Resulting, wrapped log handler.
   * @private
   */
  function _wrapLogHandler(handler, level) {
    return function (msg) {
      handler(level, msg);
    };
  }

  /**
   * @private
   */
  function _setupStdLogLevel(handlerName, consoleName) {

//  Check whether there is the console object available.
    try {
      if (window.console) {
//  Check for particular method.
        if (window.console[consoleName]) {
          //noinspection EmptyCatchBlockJS,UnusedCatchParameterJS
          window.console[consoleName]('Log initialization');
          ADL[handlerName] = function (msg) {
            window.console[consoleName](msg);
          };
          return true;
        }
      }
    }
    catch (e) {
      var i = e;
    }
    return false;
  }

  /**
   *
   * @param {string} src
   * @param {string} id
   * @param {boolean} async
   * @param {Function=} responder
   * @private
   */
  function _loadScript(src, id, async, responder) {
    if (!responder) {
      responder = ADL._nop;
    }
    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.async = async;
    po.src = src;
    po.onload = responder;
    po.id = id;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);
  }

  /**
   * Utility function to validate whether the given instance has all methods
   * of desired interface implemented.
   *
   *
   * @param iface
   * @param instance
   * @param missingMethods
   * @return {Boolean}
   * @private
   */
  ADL._validateInterface = function (IfaceClass, instance, missingMethods) {
//    In case the missingMethods aren't defined, create an empty list
    if (!missingMethods) {
      missingMethods = [];
    }

//    Instantiate the interface to be validated
    var sampleInstance = new IfaceClass();

//    Iterate through it's method to check it's presence in instance to be
//    validated
    for (var method in sampleInstance) {
      //noinspection JSUnfilteredForInLoop
      if (typeof instance[method] !== 'function') {
//          If it's not found, add the missing methods
        //noinspection JSUnfilteredForInLoop
        missingMethods.push(method);
      }
    }
//    True if there aren't any missing methods, false otherwise
    return !missingMethods.length;
  };

  ADL._validateResponder = function (responder) {
    var msg;
    if (responder === undefined) {
      msg = "Responder not defined";
      ADL._loge(msg);
      throw new ADL.AddLiveException(
          msg,
          ADL.ErrorCodes.Logic.LOGIC_INVALID_ARGUMENT);
    }
    if (!ADL._validateInterface(ADL.Responder, responder)) {
      msg = "Invalid responder";
      ADL._loge(msg);
      throw new ADL.AddLiveException(
          msg,
          ADL.ErrorCodes.Logic.LOGIC_INVALID_ARGUMENT);
    }
  };

  /**
   *
   * @type {Boolean}
   * @private
   */
  ADL._isOwnProperty = function (obj, member) {
    return Object.prototype.hasOwnProperty.call(obj, member);
  };

  ADL._mergeObj = function (dest, src) {
    for (var k in src) {
      if (Object.prototype.hasOwnProperty.call(src, k)) {
        dest[k] = src[k];
      }
    }
  };

}());
/**
 * Copyright (C) SayMama Ltd 2012
 *
 * All rights reserved. Any use, copying, modification, distribution and selling
 * of this software and it's documentation for any purposes without authors'
 * written permission is hereby prohibited.
 */
/**
 * @fileoverview
 * @TODO file description
 *
 * @author Tadeusz Kozak
 * @date 28-05-2012 14:25
 */

(function () {
  'use strict';

  /**
   * Defines all error codes returned by the AddLive Plug-In or AddLive
   * Service. The error codes are used with CDO.Responder#error method, as
   * a first parameter given.
   *
   * Error codes were split into 4 groups:
   *
   * - Logic
   * - Communication
   * - Media
   * - Common
   *
   * Each group defines error codes specific for given domain of the AddLive
   * Service.
   *
   * @namespace
   * @see ADL.Responder#err
   */
  ADL.ErrorCodes = {};


  /**
   * Logic layer error codes
   *
   * @enum {Number}
   */
  ADL.ErrorCodes.Logic = {

    /**
     * Returned when application tries to perform operation on AddLive Service
     * in context of media scope to which service is not currently connected.
     *
     * @since 1.0.0.0
     * @see ADL.AddLiveService#disconnect
     * @see ADL.AddLiveService#publish
     * @see ADL.AddLiveService#unpublish
     */
    LOGIC_INVALID_ROOM:1001,
    INVALID_ROOM:1001,

    /**
     * Returned when application passed somehow invalid argument to any of the
     * AddLiveService methods.
     *
     * @since 1.0.0.0
     */
    LOGIC_INVALID_ARGUMENT:1002,
    INVALID_ARGUMENT:1002,

    /**
     * Returned when CDO.AddLiveService#getProperty or
     * CDO.AddLiveService#getProperty was called with invalid (unknown) key.
     *
     * @since 1.0.0.0
     * @see ADL.AddLiveService#getProperty
     * @see ADL.AddLiveService#setProperty
     */
    LOGIC_INVALID_JS_PARAMETER_KEY:1003,
    INVALID_JS_PARAMETER_KEY:1003,

    /**
     * Indicates that there was unknown, fatal error during platform
     * initialization. Such a platform initialization includes e.g.
     * initialization of the COM model on windows.
     *
     * @since 1.0.0.0
     */
    PLATFORM_INIT_FAILED:1004,
    LOGIC_PLATFORM_INIT_FAILED:1004,

    /**
     * Indicates that client tried to create service while AddLive Plugin is
     * performing auto-update.
     *
     * @since 1.0.0.0
     */
    PLUGIN_UPDATING:1005,
    LOGIC_PLUGIN_UPDATING:1005,

    /**
     * Indicates that there was internal, logic failure. Most likely it's caused
     * by bug in the AddLive Plug-in code.
     *
     * @since 1.0.0.0
     */
    LOGIC_INTERNAL:1006,
    INTERNAL:1006,

    /**
     * Indicates that plugin container couldn't load logic library, most likely
     * because it is running in Windows Low Integrity mode (less privileged) and
     * the lib is already loaded by process that runs in medium integrity mode
     * (more privileged). Such a situation may occur if the AddLive SDK is used
     * by user in 2 browsers in same time. The first browser launched was
     * non-IE, the second (the one where error is reported) is IE.
     *
     * @since 1.0.0.0
     */
    LIB_IN_USE:1007,
    LOGIC_LIB_IN_USE:1007,

    /**
     * Indicates that the user's platform is unsupported for given operation.
     *
     * @since 1.15.0.6
     */
    PLATFORM_UNSUPPORTED:1009,

    /**
     * Indicates that given operation is invalid in current state of
     * the platform.
     *
     * @since 1.15.0.6
     */
    INVALID_STATE:1010
  };

  /**
   * Communication layer error codes
   *
   * @enum {Number}
   */
  ADL.ErrorCodes.Communication = {
    /**
     * Indicates that AddLive Service was trying to connect to streaming server,
     * but cannot find given host (cannot resolve host with given IP/domain
     * address). This may happen if user lost the connection to the Internet.
     *
     * @since 1.0.0.0
     * @see ADL.AddLiveService#connect
     */
    COMM_INVALID_HOST:2001,
    INVALID_HOST:2001,

    /**
     * Indicate that plugin was unsuccessful with connect attempt. It managed
     * to resolve host address and connect to it, so streaming host is running,
     * but it couldn't connect to streamer application. This may happen if
     * there is a firewall device blocking communication with the streamer's
     * management endpoint.
     *
     * @since 1.0.0.0
     * @see ADL.AddLiveService#connect
     */
    COMM_INVALID_PORT:2002,
    INVALID_PORT:2002,

    /**
     * Plugin tried to connect to streamer server, established communication
     * channel, but credentials provided by JS-client were rejected by it.
     *
     * Can be caused by:
     * - invalid credentials used by JS-client (JS-client application bug)
     * - session timeout on core server
     *
     * JS-client could try to recover by:
     * - no recovery
     *
     * @since 1.0.0.0
     * @see ADL.AddLiveService#connect
     */
    COMM_BAD_AUTH:2003,
    BAD_AUTH:2003,


    /**
     * Plugin tried to connect to streamer server, established management
     * communication link, but multimedia communication link failed, so there
     * is no way to transmit media data.
     * This error code can be used before OR after successful connection. When
     * triggered after successful connection, it indicates that media
     * connection was lost.
     *
     * @since 1.0.0.0
     * @see ADL.AddLiveService#connect
     * @see ADL.AddLiveServiceListener#onConnectionLost
     * @see ADL.ConnectionLostEvent
     */
    COMM_MEDIA_LINK_FAILURE:2005,
    MEDIA_LINK_FAILURE:2005,

    /**
     * Indicates that plug-in lost connection to streaming server. Most likely
     * due to user losing Internet connection. In case of this error, it is
     * advised to notify the user about the issue and periodically try to
     * reestablish  connection to given media scope.
     *
     * @since 1.0.0.0
     * @see ADL.AddLiveServiceListener#onConnectionLost
     * @see ADL.ConnectionLostEvent
     */
    COMM_REMOTE_END_DIED:2006,
    REMOTE_END_DIED:2006,


    /**
     * Indicates that plug-in couldn't connect to streaming server due to
     * internal, unknown and unexpected error. This error always indicates an
     * bug in AddLive Plug-In.
     *
     * @since 1.0.0.0
     * @see ADL.AddLiveService#connect
     * @see ADL.AddLiveServiceListener#onConnectionLost
     * @see ADL.ConnectionLostEvent
     */
    COMM_INTERNAL:2007,
    INTERNAL:2007,


    /**
     * Streamer rejected connection request because user with given id already
     * joined given media scope. User may join media scope only once.
     *
     * @since 1.0.0.0
     * @see ADL.AddLiveService#connect
     */
    COMM_ALREADY_JOINED:2009,
    ALREADY_JOINED:2009,

    /**
     * Indicates that the plug-in used by client is not supported by the
     * streamer to which connection attempt was made.
     *
     * Such a case will happen most likely when trying to connect using
     * a plug-in from the beta release channel to a streamer for stable channel.
     */
    PLUGIN_VERSION_NOT_SUPPORTED:2011
  };

  /**
   * Media layer error codes
   *
   * @enum {Number}
   */
  ADL.ErrorCodes.Media = {

    /**
     * Indicates that currently configured video capture
     * device (webcam) is invalid and cannot be used by AddLive Service.
     *
     * @since 1.0.0.0
     * @see ADL.AddLiveService#startLocalVideo
     * @see ADL.AddLiveService#connect
     * @see ADL.AddLiveService#setVideoCaptureDevice
     * @see ADL.AddLiveService#publish
     */
    INVALID_VIDEO_DEV:4001,
    MEDIA_INVALID_VIDEO_DEV:4001,

    /**
     * Indicates that audio capture device (microphone) haven't been configured
     * using setAudioCaptureDevice, but there is attempt to make a call with
     * audio published.
     *
     * @since 1.0.0.0
     * @see ADL.AddLiveService#connect
     * @see ADL.AddLiveService#publish
     */
    MEDIA_NO_AUDIO_IN_DEV:4002,
    NO_AUDIO_IN_DEV:4002,

    /**
     * Indicates that given audio capture device is invalid. May be thrown
     * with setAudioCaptureDevice or setAudioOutputDevice.
     *
     * @since 1.0.0.0
     * @see ADL.AddLiveService#connect
     * @see ADL.AddLiveService#publish
     */
    MEDIA_INVALID_AUDIO_IN_DEV:4003,
    INVALID_AUDIO_IN_DEV:4003,

    /**
     * Indicates that given audio output device is invalid. May be thrown
     * with setAudioOutputDevice or setAudioCaptureDevice.
     *
     * @since 1.0.0.0
     * @see ADL.AddLiveService#connect
     * @see ADL.AddLiveService#publish
     */
    MEDIA_INVALID_AUDIO_OUT_DEV:4004,
    INVALID_AUDIO_OUT_DEV:4004,

    /**
     * Indicates that either audio output or capture device initialization
     * failed and plugin cannot differ or that given audio capture and output
     * devices are for some reason incompatible.
     *
     * @since 1.0.0.0
     * @see ADL.AddLiveService#connect
     * @see ADL.AddLiveService#publish
     */
    MEDIA_INVALID_AUDIO_DEV:4005,
    INVALID_AUDIO_DEV:4005


  };


  /**
   * Common error codes
   *
   * @enum {Number}
   */
  ADL.ErrorCodes.Common = {

    /**
     * Indicates, general unhandled error. In general it means a bug in AddLive
     * Service or AddLive Plugin.
     *
     * @since 1.0.0.0
     */
    DEFAULT_ERROR:-1

  };
}());/**
 * Copyright (C) SayMama Ltd 2011
 *
 * All rights reserved. Any use, copying, modification, distribution and selling
 * of this software and it's documentation for any purposes without authors'
 * written permission is hereby prohibited.
 */

(function () {
  'use strict';

  /**
   * Base class for all native plugin wrappers. Based on given configuration
   * defines routines for checking presence and embedding.
   *
   * @since 1.0.0.0
   * @constructor
   *
   * @param {Object} configuration
   *           Configuration object - describes the plugin to wrap
   * @param {string} configuration.mimeType
   *           mime type of plugin to load
   * @param {string} configuration.classId
   *           Id of ActiveX component class to load under IE
   * @param {string} configuration.testMethod
   *           Name of method to be used when checking if plug-in was loaded
   *           correctly
   * @param {Number} [configuration.pollInterval = 500]
   *           Name of method to be used when checking if plug-in was loaded
   *           correctly
   */
  ADL.PluginWrapper = function (configuration) {
//  Copy configuration
    this.mimeType = configuration.mimeType;
    this.classId = configuration.classId;
    this.testMethod = configuration.testMethod;

//  Initial rest of internal properties
    this.objectId = this.generateObjectTagId();
    this.params = {};
    this.attributes = {};
    this.polling = false;
    this.width = 0;
    this.height = 0;
  };


  /**
   *  Initializes process of polling for plug-in.
   *
   *  @param {Function} handler
   */
  ADL.PluginWrapper.prototype.startPolling = function (handler, pollInterval) {
    this.pollingHandler = handler;
    if (this.polling) {
      return;
    }
    this.polling = true;
    this._pollInterval = pollInterval || 1000;
    this._startPolling();
  };

  /**
   *  Stops process of polling for plug-in.
   */
  ADL.PluginWrapper.prototype.stopPolling = function () {
    clearTimeout(this.pollingTimer);
  };

  /**
   *  Tries  to unload plug-in, by removing object tag.
   */
  ADL.PluginWrapper.prototype.unload = function () {
    ADL._logd("[PluginWrapper] Trying to unload plug-in");
    var pluginContainerId = this.pluginContainerId;
    if (!pluginContainerId) {
      ADL._loge("[PluginWrapper] Cannot unload plug-in: pluginContainerId " +
                    "was not specified");
    }
    ADL._logd("[PluginWrapper] Removing OBJECT tag");

    //noinspection InnerHTMLJS
    document.getElementById(this.pluginContainerId).innerHTML = '';
    ADL._logd("[PluginWrapper] OBJECT tag removed from DOM");
  };


  /**
   *  Tries to load plug-in, by embedding object tag.
   *
   *  @return {boolean}
   *             True if plugin was successfully loaded, false otherwise.
   */
  ADL.PluginWrapper.prototype.loadPlugin = function () {
    ADL._logd("[PluginWrapper] Trying to embed plug-in");
    try {
      navigator.plugins.refresh();
    } catch (e) {
      ADL._logd("Failed to refresh " + e);
    }
    var installed = this._pluginInstalled();
    if (installed !== null && !installed) {
      ADL._logd("[PluginWrapper] Pre load tests shows that plug-in isn't " +
                    "installed. Skipping");
      return false;
    }
    ADL._logd("[PluginWrapper] Setting up OBJECT tag");
    return this._loadByMime(this.mimeType);
  };

  /*
   * =============================================================================
   * Private methods
   * =============================================================================
   */


  ADL.PluginWrapper.prototype.generateObjectTagId = function () {
    var text = "plugin_";
    var possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  /**
   * Checks whether plug-in is installed or not.
   * @private
   * @return {boolean|null}
   */
  ADL.PluginWrapper.prototype._pluginInstalled = function () {
    var ua = window.navigator.userAgent;
    if (window.navigator.plugins.length) {
      var installed = false;
      var self = this;
      for (var i = 0; i < window.navigator.plugins.length; i++) {
        var plugin = window.navigator.plugins[i];
        for (var j = 0; j < plugin.length; j++) {
          var mimeType = plugin[j];
          if (mimeType.type === self.mimeType) {
            return true;
          }
        }
      }
      return false;
    } else {
      return null;
    }
  };

  /**
   *  @private
   */
  ADL.PluginWrapper.prototype._startPolling = function () {
    var self = this;
    this.pollingTimer = setTimeout(function () {
      self._pollForPlugin();
    }, this._pollInterval);
  };

  /**
   * @private
   */
  ADL.PluginWrapper.prototype._pollForPlugin = function () {
    ADL._logd("[PluginWrapper] Polling for plug-in...");
    var loadStatus = this.loadPlugin();
    if (loadStatus) {
      ADL._logd("[PluginWrapper] Plugin loaded, notyfing listener");
      this.pollingHandler();
    } else {
      ADL._logd("[PluginWrapper] failed to load the plug-in, retrying");
      this._startPolling();
    }
  };


  /**
   *
   * @param mimeType
   * @return {boolean}
   * @private
   */
  ADL.PluginWrapper.prototype._loadByMime = function (mimeType) {
    if (!this.pluginContainerId) {
      ADL._loge("[PluginWrapper] Cannot embed plug-in: pluginContainerId " +
                    "was not specified");
      return false;
    }
    ADL._logd("[PluginWrapper] Resetting innerHTML of container");
    var container = document.getElementById(this.pluginContainerId);
    //noinspection InnerHTMLJS
    container.innerHTML = this._getObjectTag(mimeType);
    if (container && container.children && container.children[0]) {
      var objectNode = container.children[0];
      if (!objectNode.nodeName) {
        objectNode.nodeName = 'object';
      }
    }
    ADL._logd("[PluginWrapper] OBJECT tag added to DOM. Testing for" +
                  " method: " + this.testMethod);
    this.pluginInstance = document.getElementById(this.objectId);
    var result = (this.testMethod === null ||
        this.testMethod in this.pluginInstance);
    if (!result) {
      ADL._logd("[PluginWrapper] Plugin " + this.mimeType +
                    " seems not to be installed");
    }
    return result;
  };

  /**
   * Builds object tag which should be used to embed the plug-in.
   *
   * @param {string} mimeType
   *          Mime-Type of plug-in to be embed.
   * @return {string}
   *          Content of the object tag.
   * @private
   */
  ADL.PluginWrapper.prototype._getObjectTag = function (mimeType) {
    var attrString = "";
    var k;
    for (k in this.attributes) {
      if (this.attributes.hasOwnProperty(k)) {
        attrString += k + '="' + this.attributes[k] + '" ';
      }
    }
    var tagContent =
        '<object type="' + mimeType + '" id="' + this.objectId + '" ' +
            'width="1" height="1"' + attrString + '>';
    for (k in this.params) {
      if (this.params.hasOwnProperty(k)) {
        tagContent += '<param name="' + k + '" value="' + this.params[k] + '"/>';
      }
    }
    //noinspection StringLiteralBreaksHTMLJS
    tagContent += '  </object>';
    return tagContent;
  };


  /**
   * ============================================================================
   *                         AddLivePlugin
   * ============================================================================
   */


  /**
   * Wrapper for the AddLive Plug-in.
   *
   * @deprecated Since 1.16.0.0 use the new CDO.initPlatform facility.
   * @since 1.0.0.0
   * @see ADL.initPlatform
   * @constructor
   * @augments ADL.PluginWrapper
   * @param {string} pluginContainerId
   *           id of the HTML element where plug-in OBJECT tag should be embedded.
   *           This element must be statically defined in the DOM (i.e. it cannot
   *           be appended dynamically with JavaScript).
   * @param {number} [clientId]
   *           AddLive client id. Affects use of custom installation binaries
   *           and streamer URLs resolving.
   */
  ADL.AddLivePlugin = function (pluginContainerId, clientId) {
    this.pluginContainerId = pluginContainerId;
    if (clientId) {
      /**
       *
       * @type {Number}
       * @private
       */
      ADL._clientId = clientId;
    }
  };

  /**
   * Configuration of the AddLive Plug-In.
   *
   * @const
   * @type {Object}
   */
  var ADDLIVE_PLUGIN_CONFIG = {
    mimeType:"application/x-addliveplugin",
    classId:"clsid: 051e3002-6ebb-5b93-9382-f13f091b2ab2",
    testMethod:"createService"
  };

  ADL.AddLivePlugin.prototype = new ADL.PluginWrapper(ADDLIVE_PLUGIN_CONFIG);
  ADL.AddLivePlugin.prototype.constructor = ADL.AddLivePlugin;


  /**
   * ============================================================================
   *                            Public API
   * ============================================================================
   */

  /**
   * Creates a AddLive Service.
   *
   * @see AddLiveService
   * @param {ADL.Responder} responder
   *           Responder object that will receive resulting responder or will
   *           handle an error
   */
  ADL.AddLivePlugin.prototype.createService = function (responder) {
    ADL._logd("[AddLivePlugin] Creating new plug-in service instance");
    responder._realResultHandler = responder.result;

    responder.result = function (service) {
      service = new ADL.AddLiveService(service);

      /**
       *
       * @type {ADL.AddLiveService}
       * @private
       */
      ADL._service = service;
      this._realResultHandler(service);
    };
    responder.setMethod("createService()");
    this.pluginInstance.createService(responder);
  };


  /**
   * Tries to self-update the AddLive Plug-in.
   *
   * @param {ADL.PluginUpdateListener} listener
   *           Listener for update events.
   * @param {string=} url
   *           URL pointing to the update descriptor which should be used with
   *           the update.
   */
  ADL.AddLivePlugin.prototype.update = function (listener, url) {
    ADL._logd("[AddLivePlugin] Updating plug-in");
    if (!url) {
      url =
          ADL._platformOptions.updateDescriptorRoot +
              ADL._UPDATE_DESCRIPTOR_NAME +
              ADL._getUpdateDescriptorSuffix();
    }
    _validateUpdateListenerMethod(listener, 'updateProgress');
    _validateUpdateListenerMethod(listener, 'updateStatus');
    if (this.pluginInstance.updateCS === undefined) {
//      Use older method if prototype-safe alias doesn't exist.
      this.pluginInstance.update(listener, url);
    } else {
//      Use new alias if exists
      this.pluginInstance.updateCS(listener, url);
    }
  };


  /**
   * Returns tag of log file currently used by the AddLive Plug-in API.
   *
   * @return {string|null}
   *            tag of log file currently used by the AddLive Plug-in API.
   *            Null, if it is impossible to obtain the logs tag.
   */
  ADL.AddLivePlugin.prototype.getLogFileTag = function () {
    ADL._logd("[AddLivePlugin] Retrieving container log file tag");
    if (this.pluginInstance.getLogFileTag === undefined) {
      return null;
    }
    return this.pluginInstance.getLogFileTag();
  };

  /**
   * Returns content of the AddLive Plug-In or service log file with given tag.
   * The content returned is a base64-encoded String.
   *
   * @param {string} tag
   *           Tag of logs to obtain.
   * @return {string|null}
   *           Content of the log file or null if it is impossible to obtain the
   *           log contents.
   */
  ADL.AddLivePlugin.prototype.getLogFileByTag = function (tag) {
    ADL._logd("[AddLivePlugin] Retrieving log file by tag " + tag);
    if (this.pluginInstance.getLogFileByTag === undefined) {
      return '';
    }
    return this.pluginInstance.getLogFileByTag(tag);
  };

  /**
   * ============================================================================
   *                       PluginUpdateListener
   * ============================================================================
   */

  /**
   * Listener class for events related to plugin updating - progress and status
   * reporting.
   *
   * @since 1.0.0.0
   * @deprecated Since 1.16.0.0 use the new CDO.initPlatform facility.
   * @see ADL.initPlatform
   * @constructor
   */
  ADL.PluginUpdateListener = function () {
  };

  /**
   * Called whenever update process increases the progress of self.
   *
   * @param {Number} progress
   *           New updating progress, in range 0-100.
   */
  ADL.PluginUpdateListener.
      prototype.
      updateProgress = function (progress) {
  };

  /**
   * Called whenever the status of the update process changes.
   *
   * @param {string} newStatus
   *           Type of the new state. Can be any of: 'UPDATING', 'UPDATED',
   *           'UP_TO_DATE', 'UPDATED_RESTART', 'NEEDS_MANUAL_UPDATE', 'ERROR'.
   * @param {Number=} errCode
   *           Optional error code, if the newStatus is 'ERROR'
   * @param {string=} errMessage
   *           Optional, human-friendly error message, if the newStatus is 'ERROR'
   */
  ADL.PluginUpdateListener.
      prototype.
      updateStatus = function (newStatus, errCode, errMessage) {
  };

  /**
   *
   * @param listener
   * @param method
   * @private
   */
  function _validateUpdateListenerMethod(listener, method) {
    if (listener[method] === undefined ||
        typeof listener[method] !== 'function') {
      throw new ADL.AddLiveException(
          "Invalid udpate listener - " + method + " method is missing or not a " +
              "function",
          ADL.ErrorCodes.Logic.LOGIC_INVALID_ARGUMENT);
    }
  }

}());/**
 * Copyright (C) SayMama Ltd 2012
 *
 * All rights reserved. Any use, copying, modification, distribution and selling
 * of this software and it's documentation for any purposes without authors'
 * written permission is hereby prohibited.
 */
/**
 * @fileoverview
 * @TODO file description
 *
 * @author Tadeusz Kozak
 * @date 28-05-2012 14:29
 */

(function () {
  'use strict';

  /**
   * Object that can receive results of calls of AddLive Plug-In or
   * AddLive Service API methods.
   *
   * @constructor
   * @param {Function=} resultHandler
   *           Function that will be called upon successful result. It should take
   *           single, optional parameter - result of the method call.
   * @param {Function=} errHandler
   *           Function that receives error result of method call. It should take
   *           two params: error code and error message.
   * @param {Object=} context
   *           Additional context that can be used success and error handlers as
   *           this. It will be merged into new instance of the Responder class.
   */
  ADL.Responder = function (resultHandler, errHandler, context) {
    if (context === undefined) {
      context = {};
    }
    if (errHandler === undefined) {
      errHandler = ADL._nop;
    }
    if (resultHandler === undefined) {
      resultHandler = ADL._nop;
    }
    var self = this;
    this.result = function (result) {
      ADL._logd("Got successful result of method call " + this.method + ": " +
                    result);
      resultHandler.call(self, result);
    };

    this.error = function (errCode, errMessage) {
      ADL._loge("Got error result of method call: " + this.method + ": " +
                    errMessage + " (" + errCode + ")");
      errHandler.call(self, errCode, errMessage);
    };
    for (var k in context) {
      if (Object.prototype.hasOwnProperty.call(context, k)) {
        this[k] = context[k];
      }
    }
  };

  /**
   * Sets method corresponding to the Responder instance. Useful for debugging
   * purposes.
   *
   * @param {string} method
   *           Method name to be set.
   */
  ADL.Responder.prototype.setMethod = function (method) {
    this.method = method;
  };

  /**
   * Successful result handler. Will be called with a value returned by
   * asynchronous invocation.
   *
   * @since 1.0.0.0
   * @param {*} [result]
   *          Value of type specific to the call performed.
   */
  ADL.Responder.prototype.resultHandler = function (result) {

  };

  /**
   * Invocation error handler - called whenever there was an error performing
   * given asynchronous operation.
   *
   * @since 1.0.0.0
   * @see ADL.ErrorCodes
   * @param {Number} errCode
   *          Error code explicitly identifying source of the problem.
   * @param {string} errMessage
   *          Additional, human-readable error message.
   */
  ADL.Responder.prototype.errHandler = function (errCode, errMessage) {

  };

  /**
   * Creates new instance of Responder object.
   *
   * @see ADL.Responder
   * @see ADL.r
   * @param {Function=} resultHandler
   *           Function that will be called upon successful result. It should take
   *           single, optional parameter - result of the method call.
   * @param {Function=} errHandler
   *           Function that receives error result of method call. It should take
   *           two params: error code and error message.
   * @param {Object=} context
   *           Additional context that can be used success and error handlers as
   *           this. It will be merged into new instance of the Responder class.
   */
  ADL.createResponder = function (resultHandler, errHandler, context) {
    return new ADL.Responder(resultHandler, errHandler, context);
  };

  /**
   * Shortcut for ADL.createResponder
   *
   * @see ADL.Responder
   * @see ADL.createResponder
   * @param {Function=} resultHandler
   *           Function that will be called upon successful result. It should take
   *           single, optional parameter - result of the method call.
   * @param {Function=} errHandler
   *           Function that receives error result of method call. It should take
   *           two params: error code and error message.
   * @param {Object=} context
   *           Additional context that can be used success and error handlers as
   *           this. It will be merged into new instance of the Responder class.
   * @return {ADL.Responder} newly created Responder object.
   */
  ADL.r = function (resultHandler, errHandler, context) {
    return ADL.createResponder(resultHandler, errHandler, context);
  };
}());/**
 * Copyright (C) SayMama Ltd 2012
 *
 * All rights reserved. Any use, copying, modification, distribution and selling
 * of this software and it's documentation for any purposes without authors'
 * written permission is hereby prohibited.
 */

/**
 * @fileoverview
 * Single class source - contains definition of the AddLiveService class.
 *
 * @author Tadeusz Kozak
 * @date 28-05-2012 16:06
 */


(function () {
  'use strict';

  var SANE_DEFAULTS_CONN_DESCR = {

    /**
     * Description of the base line video stream - the low layer. It's QVGA, with
     * bitrate equal to 64kbps and 5 frames per second
     */
    lowVideoStream:{
      publish:true,
      receive:true,
      maxWidth:320,
      maxHeight:240,
      maxBitRate:64,
      maxFps:5
    },

    /**
     * Description of the adaptive video stream - the high layer. It's QVGA, with
     * 400kbps of bitrate and 15 frames per second
     */
    highVideoStream:{
      publish:true,
      receive:true,
      maxWidth:640,
      maxHeight:480,
      maxBitRate:800,
      maxFps:15
    },

    /**
     * Flags defining that both streams should be automatically published upon
     * connection.
     */
    autopublishVideo:true,
    autopublishAudio:true
  };

  /**
   * Class wrapping the native AddLive Service object. It's main use case is to
   * easily define available API and aid the developer with some debugging tools
   * (logging).
   *
   * @since 1.0.0.0
   * @param {Object} nativeService
   *          Native service object, as returned by the AddLive Plug-in
   * @constructor
   */
  ADL.AddLiveService = function (nativeService) {
    this.nativeService = /** CDO.AddLiveService*/ nativeService;

    /**
     * @private
     * @type {number}
     */
    this.serviceid = nativeService.serviceid;
  };

  /**
   * Returns a version of Plug-In currently used. Example result: '1.15.0.2'.
   *
   * ##### Possible errors:
   *
   * - __DEFAULT_ERROR (-1)__ If an unexpected, internal error occurs
   *
   * @since 1.0.0.0
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   **/
  ADL.AddLiveService.prototype.getVersion = function (responder) {
    ADL._logd('Getting service version');
    ADL._validateResponder(responder);
    responder.setMethod('getVersion()');
    this.nativeService.getVersion(responder);
  };

  /**
   * Sets an id of web application using the SDK. Required when making
   * authorized connection request.
   *
   * ##### Possible errors:
   *
   * - __DEFAULT_ERROR (-1)__ If an unexpected, internal error occurs
   *
   * @since 1.0.0.0
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   * @param {Number} appId
   *          Application id to be set.
   **/
  ADL.AddLiveService.prototype.setApplicationId = function (responder, appId) {
    ADL._logd('Setting application id');
    ADL._validateResponder(responder);
    responder.setMethod('setApplicationId(' + appId + ')');
    this.nativeService.setApplicationId(responder, appId);
  };



  /**
   * Registers a AddLive Service listener. Listener provided here should subclass
   * the provided CDO.AddLiveServiceListener stub and implement required methods.
   *
   * ##### Possible errors:
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   * @param {ADL.AddLiveServiceListener} listener
   *          Listener to be registered.
   **/
  ADL.AddLiveService.prototype.addServiceListener =
      function (responder, listener) {
        var r = responder;
        var l = listener;
        var msg = 'Cannot register AddLive Service Listener as ';
        if (arguments.length === 0) {
          msg += 'both responder and listener were not specified';
          ADL._loge(msg);
          throw new ADL.AddLiveException(
              msg,
              ADL.ErrorCodes.Logic.LOGIC_INVALID_ARGUMENT);
        } else if (arguments.length === 1) {
          if (r.error === undefined) {
//            assume that the only parameter given is the listener.
            ADL._logw('Responder not given to the call to the ' +
                          'addServiceListener. Using default one');
            //noinspection JSValidateTypes
            l = /**CDO.AddLiveServiceListener*/ r;
            r = ADL.createResponder();
          } else {
            msg += 'listener was not specified';
            ADL._loge(msg);
            r.error(ADL.ErrorCodes.Logic.LOGIC_INVALID_ARGUMENT, msg);
            return;
          }
        }
        var missingMethods = [];
        if (!ADL._validateInterface(ADL.AddLiveServiceListener, l, missingMethods)) {
          msg = 'Got invalid AddLive Service Listener. Missing methods: ' +
              missingMethods;
          r.error(ADL.ErrorCodes.Logic.LOGIC_INVALID_ARGUMENT, msg);
          return;
        }
        var adaptedListener = new CSLA(l);
        ADL._logd('Calling plugin method addServiceListener({...})');
        r.setMethod('addServiceListener({...})');
        this.nativeService.addAddLiveServiceListener(r, adaptedListener);
      };


  /**
   * Returns an object completely describing user's computer CPU details.
   * This method is useful when checking if user's hardware is strong enough
   * to meet criteria of the AddLive Plug-in.
   *
   * ##### Example result:
   *
   * <pre>
   * {
   *   brand_string:'Intel(R) Core(TM) i5 CPU M 430 @ 2.27GHz',
   *   clock:2261,
   *   cores:4,
   *   extfamily:0,
   *   extmodel:2,
   *   family:6,
   *   model:5,
   *   stepping:2,
   *   vendor:'GenuineIntel'
   * }
   * </pre>
   *
   * ##### Possible errors:
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   */
  ADL.AddLiveService.prototype.getHostCpuDetails = function (responder) {
    ADL._logd('Calling plugin method getHostCpuDetails');
    ADL._validateResponder(responder);
    responder.setMethod('getHostCpuDetails()');
    responder._result = responder.result;
    responder.result = function (cpuInfo) {
      this._result.call(this, JSON.parse(cpuInfo));
    };
    this.nativeService.getHostCpuDetails(responder);
  };

  /**
   * Returns a list of video capture devices plugged in to the user's computer.
   * The ids of devices returned by this function should be used when
   * configuring the video capture device. Note that the device ids are
   * permanently associated with given device. It means, that it is possible to
   * store id of device selected by the user and reuse it across multiple
   * sessions.
   *
   * ##### Possible errors:
   *
   * - __MEDIA_INVALID_VIDEO_DEV (4001)__
   *
   *   May happen if there were
   *   errors on listing the devices on the OS-level. This may happen on OSX
   *   if there aren't any video devices plugged in or all devices are in use
   *   by other application.
   *
   * - __DEFAULT_ERROR (-1)__ if an unexpected, internal error occurs.
   *
   * ##### Example result:
   *
   * <code>
   * {
   *   'a3d3184172d2eb9d38797d801348744ea22cb71b':'USB 2.0 Camera',
   *   'bda5ea04b3813b906540f967fed4fe17a566f2e1':'Logitech HD Webcam C510'
   * }
   * </code>
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#setVideoCaptureDevice
   * @see ADL.AddLiveService#getVideoCaptureDevice
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   **/
  ADL.AddLiveService.prototype.getVideoCaptureDeviceNames = function (responder) {
    ADL._logd('Calling plugin method getVideoCaptureDeviceNames()');
    ADL._validateResponder(responder);
    responder.setMethod('getVideoCaptureDeviceNames()');
    this.nativeService.getVideoCaptureDeviceNames(responder);
  };

  /**
   * Sets the video capture device to be used. This method should be used
   * nevertheless the video capture device is used by application or not. It
   * configures the device in scope of the underlying AddLive Service.
   *
   *
   * Once set, the selected device will be used for local preview and publishing
   * video stream to all media scopes to which user is connected. It is also
   * possible to change the video device while in use (aka hot plug). The only
   * side effect that user may experience is short freeze of feed during the
   * change.
   *
   *
   * In case of error during device setup, the service will try to fall back
   * to previously functional device.
   *
   * ##### Possible errors:
   *
   * - __MEDIA_INVALID_VIDEO_DEV (4001)__
   *   This error code may indicate
   *   that the specified device id is either invalid (device with given id
   *   isn't plugged in at the moment of calling this method Plug-in failed to
   *   initialize the device. It may be either because the device is in use by
   *   different application or simply stopped working.
   *
   *  - __DEFAULT_ERROR (-1)__
   *    If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#getVideoCaptureDeviceNames
   * @see ADL.AddLiveService#getVideoCaptureDevice
   * @see ADL.AddLiveService#startLocalVideo
   * @see ADL.AddLiveService#connect()
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   * @param {string} deviceId
   *          Id of video device to set.
   **/
  ADL.AddLiveService.prototype.setVideoCaptureDevice =
      function (responder, deviceId) {
        ADL._logd('Calling plugin method setVideoCaptureDevice(' + deviceId + ')');
        var msg;
        if (arguments.length === 0) {

//        If there aren't any arguments given, just throw an error as it's fatal.
          msg = 'setVideoCaptureDevice failure - both responder and device ' +
              'id were not specified';
          throw new ADL.AddLiveException(
              msg,
              ADL.ErrorCodes.Logic.LOGIC_INVALID_ARGUMENT);
        } else if (arguments.length === 1) {

//          If there is single argument defined, check whether it's deviceId or responder
          if (typeof responder === 'string') {

//            If it's device id, just issue a warning and use default responder.
            ADL._logw('Responder not given - although the setVideoCaptureDevice ' +
                          'does not return any result it\'s worth using a ' +
                          'responder to handler configuration error which is ' +
                          'possible due to device misuse by user');
            deviceId = responder;
            responder = ADL.createResponder();
          } else {

//            If it's responder, call an error on it as the deviceId was not given.
            ADL._validateResponder(responder);
            msg = 'setVideoCaptureDevice failure - device id not specified';
            responder.error(msg, ADL.ErrorCodes.Logic.LOGIC_INVALID_ARGUMENT);
            return;
          }
        }

//        By now we have proper device id and something that most likely is a
//        responder. Make sure it is.
        ADL._validateResponder(responder);

        responder.setMethod('setVideoCaptureDevice(' + deviceId + ')');

//        Wrap the original result handler to persist the devices configuration
//        state
        responder._originalResultHandler = responder.result;
        responder.result = function () {
          ADL._setLocalStorageProperty(ADL._CAM_CONFIG_KEY, deviceId);
          this._originalResultHandler();
        };
        this.nativeService.setVideoCaptureDevice(responder, deviceId);
      };


  /**
   * Returns the identifier of currently configured video capture device. The
   * device is returned as a String, corresponding to device id returned by
   * getVideoCaptureDeviceNames() or an empty string if no device was configured
   * previously. Example result: 'a3d3184172d2eb9d38797d801348744ea22cb71b'.
   *
   * ##### Possible errors:
   *
   *  - __DEFAULT_ERROR (-1)__
   *
   *    If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#getVideoCaptureDeviceNames
   * @see ADL.AddLiveService#setVideoCaptureDevice
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   **/
  ADL.AddLiveService.prototype.getVideoCaptureDevice = function (responder) {
    ADL._logd('Calling plugin method getVideoCaptureDevice()');
    ADL._validateResponder(responder);
    responder.setMethod('getVideoCaptureDevice()');
    this.nativeService.getVideoCaptureDevice(responder);
  };


  /**
   * Returns a list of audio capture devices (microphones) plugged in to the
   * user's computer at the moment of call. The result is a JavaScript array
   * object, with human friendly device labels as values. Indexes of the
   * resulting array are to be used when configuring audio capture device.
   *
   * It is not guaranteed that indexes of devices are permanent across multiple
   * service sessions.
   *
   * ##### Example result:
   *
   * <code>
   * [
   *   'Microphone (HD Webcam C510)',
   *   'Microphone (Realtek High Definition Audio)'
   * ]
   * </code>
   *
   * ##### Possible errors:
   *
   * - __MEDIA_INVALID_AUDIO_DEV (4005)__
   *
   *   In case of an error with getting the amount of the devices.
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#setAudioCaptureDevice
   * @see ADL.AddLiveService#getAudioCaptureDevice
   * @see ADL.AddLiveService#getAudioOutputDeviceNames
   * @see ADL.AddLiveService#getVideoCaptureDeviceNames
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   **/
  ADL.AddLiveService.prototype.getAudioCaptureDeviceNames = function (responder) {
    ADL._validateResponder(responder);
    ADL._logd('Calling plugin method getAudioCaptureDeviceNames()');
    responder.setMethod('getAudioCaptureDeviceNames()');
    this.nativeService.getAudioCaptureDeviceNames(responder);
  };


  /**
   * Sets the audio capture device (microphone) to be used by the AddLive Service.
   * The device is configured using index of the array obtained from call to the
   * CDO.AddLiveService.getAudioCaptureDeviceNames method.
   *
   * ##### Possible errors:
   *
   * - __MEDIA_INVALID_AUDIO_IN_DEV (4003)__
   *
   *   In case of invalid device
   *   index specified specified (less then 0, greater then the amount of
   *   devices installed) or if there were problem with enabling the device
   *   (e.g. device in use on Windows XP)
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#getAudioCaptureDeviceNames
   * @see ADL.AddLiveService#getAudioCaptureDevice
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   * @param {Number} deviceId
   *          index of device to set
   **/
  ADL.AddLiveService.prototype.setAudioCaptureDevice = function (responder, deviceId) {
    ADL._logd('Calling plugin method setAudioCaptureDevice(' + deviceId + ')');
    responder.setMethod('setAudioCaptureDevice(' + deviceId + ')');
    responder._originalResultHandler = responder.result;
    responder.result = function () {
      ADL._setLocalStorageProperty(ADL._MIC_CONFIG_KEY, deviceId);
      this._originalResultHandler();
    };
    this.nativeService.setAudioCaptureDevice(responder, deviceId);
  };


  /**
   * Returns the index of currently configured audio capture device (microphone).
   * The value returned by this method is a Number, corresponding to index from
   * an array obtained from call to the
   * CDO.AddLiveService.getAudioCaptureDeviceNames method.
   *
   * ##### Possible errors:
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#getAudioCaptureDeviceNames
   * @see ADL.AddLiveService#setAudioCaptureDevice
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   **/
  ADL.AddLiveService.prototype.getAudioCaptureDevice = function (responder) {
    ADL._logd('Calling plugin method getAudioCaptureDevice()');
    ADL._validateResponder(responder);
    responder.setMethod('getAudioCaptureDevice()');
    this.nativeService.getAudioCaptureDevice(responder);
  };


  /**
   * Returns a list of audio output devices (speakers, headphones) plugged in to
   * the user's computer at the moment of call. The result is a JavaScript array
   * object, with human friendly device labels as values. Indexes of the
   * resulting array are to be used when configuring the audio output device.
   *
   * It is not guaranteed that indexes of devices are permanent across multiple
   * service sessions.
   *
   * ##### Example result:
   *
   * <code>
   * [
   *   'Speaker/HP (Realtek High Definition Audio)'
   *   'Headset Earphone (Sennheiser DECT)'
   * ]
   * </code>
   *
   * ##### Possible errors:
   *
   * - __MEDIA_INVALID_AUDIO_DEV (4005)__
   *
   *   In case of an error with getting the amount of the devices.
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#setAudioOutputDevice
   * @see ADL.AddLiveService#getAudioOutputDevice
   * @see ADL.AddLiveService#getAudioCaptureDeviceNames
   * @see ADL.AddLiveService#getVideoCaptureDeviceNames
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   **/
  ADL.AddLiveService.prototype.getAudioOutputDeviceNames = function (responder) {
    ADL._logd('Calling plugin method getAudioOutputDeviceNames()');
    ADL._validateResponder(responder);
    responder.setMethod('getAudioOutputDeviceNames()');
    this.nativeService.getAudioOutputDeviceNames(responder);
  };


  /**
   * Sets the audio output device (speakers, microphone) to be used by
   * the this.nativeService.
   *
   * ##### Possible errors:
   *
   * - __MEDIA_INVALID_AUDIO_IN_DEV (4003)__
   *
   *   In case of invalid device
   *   index specified specified (less then 0, greater then the amount of
   *   devices installed) or if there were problem with enabling the device
   *   (e.g. device in use on Windows XP) TODO fix this in the plugin!
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#getAudioOutputDeviceNames
   * @see ADL.AddLiveService#getAudioOutputDevice
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   * @param deviceId index of device in array returned by the
   *         getAudioOutputDeviceNames() method
   *
   **/
  ADL.AddLiveService.prototype.setAudioOutputDevice = function (responder, deviceId) {
    ADL._logd('Calling plugin method setAudioOutputDevice(' + deviceId + ')');
    responder.setMethod('setAudioOutputDevice(' + deviceId + ')');
    responder._originalResultHandler = responder.result;
    responder.result = function () {
      ADL._setLocalStorageProperty(ADL._SPK_CONFIG_KEY, deviceId);
      this._originalResultHandler();
    };
    this.nativeService.setAudioOutputDevice(responder, deviceId);
  };


  /**
   * Returns the index of currently configured audio output device.
   *
   * ##### Possible errors:
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#getAudioOutputDeviceNames
   * @see ADL.AddLiveService#setAudioOutputDevice
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   **/
  ADL.AddLiveService.prototype.getAudioOutputDevice = function (responder) {
    ADL._logd('Calling plugin method getAudioOutputDevice()');
    ADL._validateResponder(responder);
    responder.setMethod('getAudioOutputDevice()');
    this.nativeService.getAudioOutputDevice(responder);
  };


  /**
   * Returns list of sources available for screen sharing. Sources here refers to
   * user's desktops and opened windows. The resulting Array contains objects with
   * following attributes:
   *
   * - __id__    id of the screen sharing item. It should be used when publishing the
   *   stream
   *
   * - __image__ Object containing preview of screen shot image depicting
   *             the screen sharing source. It's contain following fields:
   *
   *   - _base64_ - String with picture data encoded using png and
   *   base64. One should use it with image tag as
   *   follows:
   *   <pre>
   *   var imgTag = '&lt;img src='data:img/png;base64,'+ image.base64 +''/&gt;';
   *   </pre>
   *
   *   - _width_ - native width of the screen shot taken
   *
   *   - _height_ native height of the screen shot taken
   *
   * - __title__ Human-readable title of the share source.
   *
   * Since passing the real-sized thumbnails with screen sharing source as
   * real-sized, base64 encoded PNG image is highly inefficient, this method takes
   * additional thumbWidth param, which should be set to the desired width of the
   * images, as required by the UI. The images will be scaled down.
   *
   * Additionally, if AddLive Service fails to obtain screen shot of given
   * screen sharing source, the image field will have the base64 property empty.
   *
   * @example
   * // Simple example showing how to list all currently available screen
   * // sharing sources:
   *
   * function showScreenShareSources(sources) {
   *    var srcsList = document.getElementById('screenShareSources');
   *
   *    // Iterate through all the screen sharing sources given
   *    for(var i = 0;i&lt;sources.length;i++) {
   *
   *      // Create a &lt;li&gt; wrapper for each one
   *      var srcWrapper = document.createElement('li');
   *      srcWrapper.id = 'shareItm' + i;
   *
   *      // Get the current share item.
   *      var src = sources[i];
   *
   *      // Create image for showing the screen grab preview
   *      var image = document.createElement('img');
   *
   *      // Check whether the AddLive Service managed to obtain the scree shot
   *      if(src.image.base64) {
   *
   *        // Use the data URI scheme
   *        // http://en.wikipedia.org/wiki/Data_URI_scheme
   *        image.src = 'data:img/png;base64,' + src.image.base64;
   *        image.width = src.image.width;
   *        image.height = src.image.height;
   *      } else {
   *
   *        // Service failed to obtain the screen shot - fall back to place holder
   *        image.src = 'http://myapp.com/window_placeholder.png'
   *        image.width = 120;
   *        image.height = 80;
   *      }
   *
   *      // Add the preview
   *      srcWrapper.appendChild(image);
   *
   *      // Create the node with the window title
   *      var titleWrapper = document.createElement('p');
   *      titleWrapper.innerText = src.title;
   *      srcWrapper.appendChild(titleWrapper);
   *
   *      // Register click handler to publish the screen
   *      srcWrapper.shareItemId = src.id;
   *      srcWrapper.onclick = function(){
   *        publishShareItm(this.shareItemId);
   *      };
   *
   *      // Finally append the node
   *      srcsList.appendChild(srcWrapper);
   *    }
   * }
   *
   * // Define the error handler
   * function onGetScreenCaptureSourcesError(errCode, errMessage) {
   *    console.error('Failed to fetch screen sharing sources due to: ' +
   *    errMessage + ' (' + errCode + ')' );
   * }
   *
   * // Obtain the AddLive service (not covered by this example)
   * var AddLiveService = getAddLiveService();
   *
   * // Request the screen sharing sources
   * AddLiveService.getScreenCaptureSources(
   *    CDO.createResponder(showScreenShareSources,
   *                        onGetScreenCaptureSourcesError),
   *    320
   * );
   *
   * @since 1.15.0.1
   * @see ADL.AddLiveService#publish
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   * @param {Number} thumbWidth
   *          Desired width of preview thumbnails.
   */
  ADL.AddLiveService.prototype.getScreenCaptureSources =
      function (responder, thumbWidth) {
        ADL._logd('Calling plugin method getScreenCaptureDeviceNames(' + thumbWidth + ')');
        responder.setMethod('getScreenCaptureDeviceNames(' + thumbWidth + ')');
        ADL._validateResponder(responder);
        responder._originalResultHandler = responder.result;
        responder.result = function (devs) {
//    Parse the devices list returned as a JSON-encoded string to JS object.
          devs = JSON.parse(devs);
          this._originalResultHandler(devs);
        };
        //noinspection JSCheckFunctionSignatures
        this.nativeService.getScreenCaptureDeviceNames(responder, thumbWidth);
      };

  /**
   * Starts previewing video stream of current user. Internally this method:
   *
   * - checks whether selected video capture device is enabled and captures
   *   frames. If not - enables it.
   *
   * - checks whether local preview renderer is defined or not, if not -
   *   creates one and links it to the video capture device
   *
   * - returns a string that can be used to render the live feed
   *
   * The string returned by this method, should be used to create video renderer
   * provided by the AddLive plugin, refer to the rendering section of the AddLive
   * API docs for more details for more details.
   *
   * ##### Possible errors:
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * - __MEDIA_VCAM_INIT_FAILED (4006)__
   *
   *   In case of error during renderer creation.
   *
   * - __MEDIA_INVALID_VIDEO_DEV (4001)__
   *
   *   If the video capture device configured doesn't work.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#stopLocalVideo
   * @see ADL.AddLiveService#setVideoCaptureDevice
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   **/
  ADL.AddLiveService.prototype.startLocalVideo = function (responder) {
    ADL._logd('Calling plugin method startLocalVideo()');
    ADL._validateResponder(responder);
    responder.setMethod('startLocalVideo()');
    this.nativeService.startLocalVideo(responder, 640, 480);
  };

  /**
   * Stops previewing local video feed of the user. Internally it frees all
   * resources needed to render the local preview and also releases the video
   * capture device if it's not used by any established connection.
   *
   * ##### Possible errors:
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#startLocalVideo
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   **/
  ADL.AddLiveService.prototype.stopLocalVideo = function (responder) {
    ADL._logd('Calling plugin method stopLocalVideo()');
    if (!responder) {
      responder = ADL.createResponder();
    }
    responder.setMethod('stopLocalVideo()');

    this.nativeService.stopLocalVideo(responder);
  };

  /**
   * Establishes connection to the streaming server using given description.
   * This is the most important method of all provided by the AddLive Service API.
   *
   *
   * ##### Connection descriptor
   *
   * The only one input parameter, connectionDescriptor completely
   * describes client requirements on the connection to be established. It is a
   * JavaScript object with following attributes:
   *
   *
   * - __[url] (String)__ URL of streamer to connect to. In form:
   *
   *       IP_OR_DOMAIN_NAME:PORT/SCOPE_ID
   *
   *   SCOPE_ID, defines a media scope within the streamer. All users connected to
   *   a particular scope exchange media streams published within the scope.
   *   If given user publishes a stream (audio, video, screen or any combination
   *   of them) all users connected to this scope will be receiving this stream.
   *   Additionally, the SCOPE_ID param is used in connection management
   *   API - to specify the scope on which given action should be performed.
   *   The url attribute is optional, and needs to be specified only if
   *   __scopeId__ wasn't defined.
   *
   * - __[lowVideoStream] (Object)__
   *
   *   Defines the low quality video stream to be published (see the Video
   *   streams configuration section below). This property is optional, with
   *   sane defaults: resolution of 320x240 at 5 frames per second with 64 kbps
   *   bit rate cap.
   *
   * - __[highVideoStream] (Object)__
   *
   *   Defines the high quality video stream to be published (see the Video
   *   streams configuration section below). This property is optional, with
   *   sane defaults: resolution of 640x480 at 15 frames per second with 800 kbps
   *   bit rate cap.
   *
   * - __[autopublishVideo] (Boolean)__
   *
   *   Flag defining whether local user's video stream should be automatically
   *   published upon successful connection, __true__ by default.
   *
   * - __autopublishAudio (Boolean)__
   *
   *   Flag defining whether local user's audio stream should be automatically
   *   published upon successful connection, __true__ by default.
   *
   * - __authDetails (Object)__
   *
   *   Defines the connection authentication details, for more details please
   *   refer to:  http://www.addlive.com/docs.html#authentication
   *
   * #####  Video streams configuration
   *
   * The AddLive Service uses 2 quality layers for video streaming - the
   * 'low' and 'high' layer. The 'low' layer contains video stream with constant
   * bit rate, spatial resolution and temporal resolution (read: there aren't any
   * adaptation routines enabled for the low layer). It is the first layer to be
   * published and it requires user to have enough bandwidth to handle the
   * transmission. It implies that low configuration should be rather really low
   * (up to 100kbps, QVGA) unless it is certain that user can transmit data at higher
   * rates.
   *
   * On the other hand, the 'high' layer have all the adaptation routines enabled
   * and is intended to increase the quality of the video stream published as much
   * as user's setup (hardware devices, network connection) permits. It is being
   * published only if the network conditions allow and can be dropped down if
   * network condition changes. The high quality stream dynamically configure to
   * provide best UX user can have in given configuration. To achieve this,
   * network and CPU use is being constantly monitored and depending on the
   * current state, the service is adjusting quality, spatial resolution and
   * temporal resolution, until maximal values configured during the connection
   * setup is reached.
   *
   * When user publishes the 'high' layer stream, the 'low' one is still  send.
   * The streamer uses the 'low' quality stream to perform the  down-link
   * adaptation - the streamer transmits the high video layer only to the
   * participants that can actually receive it.
   *
   * Additionally it is possible to define whether the user should publish
   * or receive the 'high' layer. The main use case here is to allow sharing
   * scopes between different types of connections. E.g. some users might be
   * participants of given conversation and thus receiving and publishing high
   * quality video stream and others might be just previewing (e.g. to decide
   * whether to join it or not) thus, receiving only the low layer.
   *
   * To configure each video stream, JavaScript object with following
   * attributes:
   *
   * - __publish (boolean)__
   *
   *   Flag defining whether this layer should be published or not.
   *
   * - __receive (boolean)__
   *
   *   Flag defining whether this layer should be received by the user.
   *
   * - __maxWidth (Number)__
   *
   *   Defines maximal width of the video stream. The low layer will publish
   *   stream with exactly this width, the high layer will stop increasing the
   *   resolution, after reaching this value.
   *
   * - __maxHeight (Number)__
   *
   *   Defines maximal height of the video stream. Same rules as with width apply.
   *
   * - __maxBitRate (Number)__
   *
   *   Integer defining the video stream's bitrate. The low layer will publish
   *   stream with this constant bitrate; the high layer will stop increasing the
   *   quality and resolutions when reaching this cap
   *
   * - __maxFps (Number)__
   *
   *   Defines maximal amount of frames per second the video stream should use.
   *
   *
   * ##### Authentication
   *
   *
   * ##### Notifications
   *
   * Whenever AddLive Service detects that new user joined particular scope
   * by establishing a connection to it, the
   * CDO.AddLiveServiceListener.onUserEvent method is being called on all
   * registered service listeners. In this case, the CDO.UserStateChangedEvent,
   * will have flag isConnected set to true and all streaming details filled
   * according to the streaming configuration specified by the connection
   * descriptor.
   *
   * ##### Possible errors:
   *
   * - __MEDIA_INVALID_VIDEO_DEV (4001)__
   *
   *   In case there was an error using currently selected video capture device
   *   (e.g. device in use by different application or just stopped working)
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs
   *
   * - __COMM_INVALID_HOST (2001)__
   *
   *   Indicates failure in DNS lookup of host specified in the url or streamer
   *   box being off-line
   *
   * - __COMM_INVALID_PORT (2002)__
   *
   *   Indicates that service failed to connect to the streaming server. Either
   *   the traffic gets blocked by the firewall or streaming server is down
   *
   * - __COMM_BAD_AUTH (2003)__
   *
   *   Indicates authentication error. Most likely due to invalid token.
   *
   * - __COMM_MEDIA_LINK_FAILURE (2005)__
   *
   *   Indicates failure in establishing media connection. It means that the
   *   media streams are blocked somewhere on the path between the user and
   *   the streaming server. Most likely, it's due to a firewall blocking media
   *   traffic.
   *
   * - __SEND_INVALID_ARGUMENT (2008)__
   *
   *   Invalid connection descriptor given.
   *
   * - __COMM_ALREADY_JOINED (2009)__
   *
   *   User with given id already joined given scope. User id must be unique
   *   in scope boundaries.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#disconnect
   * @see ADL.AddLiveService#publish
   * @see ADL.AddLiveService#unpublish
   * @see ADL.AddLiveServiceListener#onUserEvent
   * @see ADL.UserStateChangedEvent
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   * @param {Object} connectionDescription
   *          Details of the connection to establish.
   * @param {string} [connectionDescription.url]
   *          URL of scope to connect to
   * @param {string} [connectionDescription.scopeId]
   *          id of scope to connect to. Will be used to generate a URL if
   *          given. URL property takes precedence.
   * @param {Object} connectionDescription.authDetails
   *          User's authentication details.
   * @param {Object} connectionDescription.lowVideoStream
   *          Defines the low quality video stream to be published (see the Video
   *          streams configuration section below).
   * @param {Object} connectionDescription.highVideoStream
   *          Defines the high quality video stream to be published (see the Video
   *          streams configuration section below).
   * @param {boolean} connectionDescription.autopublishVideo
   *          Flag defining whether local user's video stream should be automatically
   *          published upon successful connection
   * @param {boolean} connectionDescription.autopublishAudio
   *          Flag defining whether local user's audio stream should be
   *          automatically published upon successful connection
   */
  ADL.AddLiveService.prototype.connect = function (responder, connectionDescription) {
    ADL._logd('Calling plugin method connect(' + connectionDescription + ')');
    responder.setMethod('connect(' + JSON.stringify(connectionDescription) + ')');
    var mergedConnDescr = {};
    for(var key in SANE_DEFAULTS_CONN_DESCR) {
      if(Object.prototype.hasOwnProperty.call(SANE_DEFAULTS_CONN_DESCR, key)) {
        mergedConnDescr[key] = SANE_DEFAULTS_CONN_DESCR[key];
      }
    }
    for(key in connectionDescription) {
      if(Object.prototype.hasOwnProperty.call(connectionDescription, key)) {
        mergedConnDescr[key] = connectionDescription[key];
      }
    }
    if (!_sanitizeConnectionDescriptor(responder, mergedConnDescr)) {
      return;
    }
    var url = mergedConnDescr.url;
    var scopeId = _unwrapScopeId(_getScopeFromURL(url));
    var params = JSON.stringify(mergedConnDescr);
    responder._originalResultHandler = responder.result;
    responder.result = function (result) {
      this._originalResultHandler(new ADL.MediaConnection(scopeId));
    };
    ADL._logd('Connecting to Streamer endpoint with URL: ' + url);
    this.nativeService.connect(responder, params);
  };

  /**
   * Gets the list identifiers of users connected to scope with same given id.
   * The responder will receive single parameter - JavaScript Array containing
   * the identifiers.
   * @since 1.17.1
   * @see ADL.AddLiveService#connect
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   * @param scopeId
   *        {String} Id of scope to get participants of
   * @param [token]
   *        {String} authentication token.
   */
  ADL.AddLiveService.prototype.
      getConnectedUsers = function (responder, scopeId, token) {
    responder.setMethod('getConnectedUsers(' + scopeId + ',' + token + ')');
    if(token === undefined) {
      token = '1';
    }
    var url =
        ADL._getStreamerEndpoint(scopeId) + '/' + _wrapScopeId(scopeId);
    this.nativeService.getConnectedUsers(responder, url, token);
  };

  /**
   * Disconnects previously established connection to the streaming server.
   *

   * ##### Notifications
   *
   * Whenever AddLive Service detects that new user leaves particular scope
   * by terminating a connection to it, the
   * CDO.AddLiveServiceListener.onUserEvent method is being called on all
   * registered service listeners. In this case, the CDO.UserStateChangedEvent,
   * will have flag isConnected set to false. Other properties are undefined.
   *
   * ##### Possible errors:
   *
   * - __LOGIC_INVALID_ROOM (1001)__
   *
   *   With instance of plugin service is not connected to media scope with
   *   given id.
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#connect
   * @see ADL.AddLiveServiceListener#onUserEvent
   * @see ADL.UserStateChangedEvent
   * @param {ADL.Responder} [responder]
   *          Responder object. See calling AddLive plug-in service methods.
   * @param {string}
      *          scopeId  id of media scope to disconnect
   **/
  ADL.AddLiveService.prototype.disconnect = function (responder, scopeId) {
    ADL._logd('Calling plugin method disconnect(' + scopeId + ')');
    if (typeof responder === 'string') {
      scopeId = responder;
      responder = ADL.createResponder();
    }
    responder.setMethod('disconnect(' + scopeId + ')');

    this.nativeService.disconnect(responder, _wrapScopeId(scopeId));
  };


  /**
   * Generic publish method - allows to start broadcasting to given scope media
   * of particular type with specified configuration (if required by the media
   * type)
   *
   * ##### Possible Errors:
   *
   * - __LOGIC_INVALID_ROOM (1001)__
   *
   *   With instance of plugin service is not connected to media scope with
   *   given id.
   *
   * - __MEDIA_INVALID_VIDEO_DEV (4001)__
   *
   *   In case there was an error using currently selected video capture device
   *   (e.g. device in use by different application or just stopped working)
   *
   *  - __MEDIA_INVALID_AUDIO_DEV (4005)__
   *
   *   In case of error with initializing microphone.
   *
   *  - TODO Add an error code for missing screen
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs
   *
   * ##### Notifications
   *
   * Whenever AddLive Service detects that user publishes or stops publishing
   * stream of particular media type, the
   * CDO.AddLiveServiceListener.onMediaStreamEvent method is being called on all
   * registered service listeners. In this case, the CDO.UserStateChangedEvent,
   * will have the mediaType property filled with type of media which state was
   * changed and the streaming status defined in one of the __audioPublished__,
   * __videoPublished__, __screenPublished__ properties.
   *
   * @since 1.15.0.2
   * @see ADL.AddLiveService#connect
   * @see ADL.AddLiveService#unpublish
   * @see ADL.AddLiveService#getScreenCaptureSources
   * @see ADL.MediaType.AUDIO
   * @see ADL.MediaType.VIDEO
   * @see ADL.MediaType.SCREEN
   * @see ADL.AddLiveServiceListener#onMediaStreamEvent
   * @see ADL.UserStateChangedEvent
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   * @param {string} scopeId
   *          id of scope to which media broadcasting should be started
   * @param {string} what
   *          type of media to be published, may be one of:
   *          CDO.MediaType.AUDIO, CDO.MediaType.VIDEO, CDO.MediaType.SCREEN
   * @param {Object} [details]
   *          additional details describing how exactly media should be
   *          published. In current version, the details object is used only
   *          when publishing the CDO.MediaType.SCREEN media type.
   * @param {string} [details.windowId]
   *          id of the screen sharing source to be shared when publishing the
   *          SCREEN media type
   * @param {number} [details.nativeWidth]
   *          width of the component that will render the screen sharing sink
   *          on the remote end. AddLiveService uses this value to define the
   *          maximal width that will be down scaled before encoding the frame.
   */
  ADL.AddLiveService.prototype.publish =
      function (responder, scopeId, what, details) {
        if (details === undefined) {
          details = '';
        }
        var methodString = 'publish(' + scopeId + ', ' + what + ', ' +
            JSON.stringify(details) + ')';
        ADL._logd('Calling plugin method ' + methodString);
        responder.setMethod(methodString);
        this.nativeService.publish(responder, _wrapScopeId(scopeId), what, details);
      };

  /**
   * Generic unpublish method - stops publishing media stream of desired type
   * to given media scope.
   *
   *
   * ##### Notifications
   *
   * Whenever AddLive Service detects that user publishes or stops publishing
   * stream of particular media type, the
   * CDO.AddLiveServiceListener.onMediaStreamEvent method is being called on all
   * registered service listeners. In this case, the CDO.UserStateChangedEvent,
   * will have the mediaType property filled with type of media which state was
   * changed and the streaming status defined in one of the __audioPublished__,
   * __videoPublished__, __screenPublished__ properties.
   *
   *
   * ##### Possible Errors:
   *
   * - __LOGIC_INVALID_ROOM (1001)__
   *
   *   With instance of plugin service is not connected to media scope with
   *   given id.
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs
   *
   * @since 1.15.0.2
   * @see ADL.AddLiveService#connect
   * @see ADL.AddLiveService#publish
   * @see ADL.AddLiveService#MEDIA_TYPE_AUDIO
   * @see ADL.AddLiveService#MEDIA_TYPE_SCREEN
   * @see ADL.AddLiveService#MEDIA_TYPE_VIDEO
   * @see ADL.AddLiveServiceListener#onMediaStreamEvent
   * @see ADL.UserStateChangedEvent
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   * @param {string} scopeId
   *          Id of media scope to stop publishing to.
   * @param {string} what
   *          Type of media to stop publishing.
   */
  ADL.AddLiveService.prototype.unpublish = function (responder, scopeId, what) {
    var methodString = 'unpublish(' + scopeId + ', ' + what + ')';
    ADL._logd('Calling plugin method ' + methodString);
    responder.setMethod(methodString);
    this.nativeService.unpublish(responder, _wrapScopeId(scopeId), what);
  };

  /**
   * Sends an opaque message between peers connected to the media scope. It is
   * possible to send a message to single recipient only, by providing the 4th
   * optional targetUserId param.
   *
   * ##### Possible Errors:
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.15.0.1
   * @see ADL.AddLiveService#connect
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   * @param {string} scopeId
   *          Id of media scope in which message should be broadcasted
   * @param {string} message
   *          Message to be broadcasted
   * @param {Number=} targetUserId
   *          Id of user to optionally send a direct message. User must be
   *          connected to given scope, if not, message will be simply dropped.
   */
  ADL.AddLiveService.prototype.sendMessage =
      function (responder, scopeId, message, targetUserId) {
        var method = 'broadcast(' + scopeId + ', ' + message + ', ' +
            targetUserId + ')';
        ADL._logd('Calling plugin method ' + method);
        responder.setMethod(method);
        scopeId = _wrapScopeId(scopeId);
        if (targetUserId) {
          //noinspection JSCheckFunctionSignatures
          this.nativeService.broadcast(responder, scopeId, message, targetUserId);
        } else {
          //noinspection JSCheckFunctionSignatures
          this.nativeService.broadcast(responder, scopeId, message);
        }
      };

  /**
   * Gets current volume level of the audio output device. The result is an
   * integer with values in range 0-255.
   *
   * ##### Possible errors:
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#setSpeakersVolume
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   **/
  ADL.AddLiveService.prototype.getSpeakersVolume = function (responder) {
    ADL._logd('Calling plugin method getSpeakersVolume()');
    responder.setMethod('getSpeakersVolume()');
    this.nativeService.getSpeakersVolume(responder);
  };

  /**
   * Sets current volume level of the audio output device;
   *
   * ##### Possible errors:
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#getSpeakersVolume
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   * @param {Number} volume
   *          integer containing new volume level (unsigned int in range 0-255)
   **/
  ADL.AddLiveService.prototype.setSpeakersVolume = function (responder, volume) {
    ADL._logd('Calling plugin method setSpeakersVolume(' + volume + ')');
    responder.setMethod('setSpeakersVolume(' + volume + ')');
    this.nativeService.setSpeakersVolume(responder, volume);
  };

  /**
   * Gets current gain level of the audio input device. Note that this method
   * should be used only if the Automatic Gain Control is disabled. Using it
   * with AGC enabled doesn't cause ane bugs, but is pointless as the AGC
   * sub-module of audio engine will change the gain almost instantly. It may
   * only cause negative experience for the user (e.g. echo or noise). The value
   * returned by this method is an integer with values in range 0-255.
   *
   * ##### Possible errors:
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#setMicrophoneVolume
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   **/
  ADL.AddLiveService.prototype.getMicrophoneVolume = function (responder) {
    ADL._logd('Calling plugin method getMicrophoneVolume()');
    responder.setMethod('getMicrophoneVolume()');
    this.nativeService.getMicrophoneVolume(responder);
  };

  /**
   * Sets gain level of the audio input device. The value
   * returned by this method is an integer with values in range 0-255.
   *
   * ##### Possible errors:
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#getMicrophoneVolume
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   **/
  ADL.AddLiveService.prototype.setMicrophoneVolume = function (responder, volume) {
    ADL._logd('Calling plugin method setMicrophoneVolume(' + volume + ')');
    responder.setMethod('setMicrophoneVolume(' + volume + ')');
    this.nativeService.setMicrophoneVolume(responder, volume);
  };

  /**
   * Activates or deactivates monitoring of the audio input device activity -
   * speech level. The level will be reported using callback API micActivity()
   * method each 300ms. Monitoring mic activity is resource intensive process,
   * it is highly recommended to use it only when needed (e.g. when rendering
   * audio capture device selection form).
   *
   * ##### Possible errors:
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveServiceListener#micActivity
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   * @param {boolean} enabled
   *          Flag defining whether monitoring of audio capture device activity
   *          should be enabled or disabled.
   */
  ADL.AddLiveService.prototype.monitorMicActivity = function (responder, enabled) {
    ADL._logd('Calling plugin method monitorMicActivity(' + enabled + ')');
    responder.setMethod('monitorMicActivity(' + enabled + ')');
    this.nativeService.monitorMicActivity(responder, enabled);
  };


  /**
   * Starts measuring media statistics for media connection to given scope.
   *
   * ##### Possible errors:
   *
   * - __LOGIC_INVALID_ARGUMENT (1002)__
   *
   *   Invalid interval given - negative value.
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#stopMeasuringStats
   * @see ADL.AddLiveServiceListener#newVideoStats
   * @see ADL.AddLiveServiceListener#newAudioStats()
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   * @param {string} scopeId
   *          id of media scope to measure media stats of
   * @param {Number} interval
   *          stats refresh interval, in seconds
   */
  ADL.AddLiveService.prototype.startMeasuringStatistics =
      function (responder, scopeId, interval) {
    ADL._logd('Calling plugin method startMeasuringStatistics(' + scopeId + ', ' +
                  interval + ')');
    responder.setMethod('startMeasuringStatistics(' + scopeId + ', ' + interval +
                            ')');
    scopeId = _wrapScopeId(scopeId);
    this.nativeService.startMeasuringStatistics(responder, scopeId, interval);
  };

  /**
   * Stops measuring media statistics for media connection to given scope.
   *
   * ##### Possible errors:
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#stopMeasuringStats
   * @see ADL.AddLiveServiceListener#newVideoStats
   * @see ADL.AddLiveServiceListener#newAudioStats()
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   * @param {string} scopeId
   *          id of media scope to measure media stats of
   */
  ADL.AddLiveService.prototype.stopMeasuringStatistics =
      function (responder, scopeId) {
    ADL._logd('Calling plugin method stopMeasuringStatistics(' + scopeId + ')');
    responder.setMethod('stopMeasuringStatistics(' + scopeId + ')');
    scopeId = _wrapScopeId(scopeId);
    this.nativeService.stopMeasuringStatistics(responder, scopeId);
  };

  /**
   * Starts playing test sound. The playing will stop automatically after
   * reaching end of the test wave file or may be stopped by calling
   * stopPlayingTestSound method. The startPlayingTestSound method is mostly
   * useful when selecting audio output device and setting volume levels - user
   * can test the device and desired levels.
   *
   * ##### Possible errors:
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *   In case of this method, it may mean that the wave file used to playing
   *   the test sound is missing thus the plugin installation is somehow
   *   compromised.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#stopPlayingTestSound
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   */
  ADL.AddLiveService.prototype.startPlayingTestSound = function (responder) {
    ADL._logd('Calling plugin method startPlayingTestSound()');
    responder.setMethod('startPlayingTestSound()');
    this.nativeService.startPlayingTestSound(responder);
  };

  /**
   * Stops playing test sound.
   *
   * ##### Possible errors:
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#startPlayingTestSound
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   */
  ADL.AddLiveService.prototype.stopPlayingTestSound = function (responder) {
    ADL._logd('Calling plugin method stopPlayingTestSound()');
    responder.setMethod('stopPlayingTestSound()');
    this.nativeService.stopPlayingTestSound(responder);
  };

  /**
   * Gets value of the service property. Advanced use only, check the
   * Service Properties section.
   *
   * ##### Possible errors:
   *
   * - __LOGIC_INVALID_JS_PARAMETER_KEY (1003)__
   *
   *   Invalid property key was given (empty or unknown by the service).
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#setSmProperty
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   * @param {string} name
   *          name of the property to get value of
   */
  ADL.AddLiveService.prototype.getProperty = function (responder, name) {
    var method = 'getSmProperty(' + name + ')';
    ADL._logd('Calling plugin method ' + method);
    responder.setMethod(method);
    //noinspection JSCheckFunctionSignatures
    this.nativeService.getSmProperty(responder, name);
  };

  /**
   * Sets value of the service property. Advanced use only, check the
   * Service Properties section.
   *
   * ##### Possible errors:
   *
   * - __DEFAULT_ERROR (-1)__
   *
   *   If an unexpected, internal error occurs.
   *
   * @see ADL.AddLiveService#getSmProperty()
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   * @param {string} name
   *          name of the property to set value of.
   * @param {string|Number|boolean} value
   *          value of the property to be set.
   */
  ADL.AddLiveService.prototype.setProperty = function (responder, name, value) {
    var method = 'setSmProperty(' + name + ', ' + value + ')';
    ADL._logd('Calling plugin method ' + method);
    responder.setMethod(method);
    //noinspection JSCheckFunctionSignatures
    this.nativeService.setSmProperty(responder, name, value);
  };

  /**
   * Retrieves the tag of log file used by the service instance.
   * To obtain the content of the log file, use the
   * CDO.AddLivePlugin.getLogFileTag method.
   *
   * @since 1.15.0.0
   * @see ADL.AddLivePlugin.getLogFileTag
   * @param {ADL.Responder} responder
   *          Responder object. See calling AddLive plug-in service methods.
   */
  ADL.AddLiveService.prototype.getLogFileTag = function (responder) {
    var method = 'getLogFileTag()';
    ADL._logd('Calling plugin method ' + method);
    responder.setMethod(method);
    this.nativeService.getLogFileTag(responder);
  };

  /**
   * @private
   */
  ADL.AddLiveService.prototype.echo = function (responder, value) {
    this.nativeService.echo(responder, value);
  };

  /**
   * @private
   */
  ADL.AddLiveService.prototype.echoNotification = function (responder, value) {
    this.nativeService.echoNotification(responder, value);
  };

  /**
   * =====================================================================
   *              class CSLA
   * =====================================================================
   */

  /**
   * AddLive Service Listener Adapter
   * Plug-in <-> AddLive API adapter. Makes sure that the AddLive API is seen
   * to the outside world, without the need to change the plug-in code.
   *
   * @param {ADL.AddLiveServiceListener} listener
   * @private
   * @constructor
   */
  function CSLA(listener) {
    this.listener = listener;
  }

  CSLA.prototype.videoFrameSizeChanged =
      function (sinkId, width, height) {
        this.listener.onVideoFrameSizeChanged(
            new ADL.VideoFrameSizeChangedEvent(sinkId, width, height));
      };

  CSLA.prototype.connectionLost = function (scopeId, errCode, errMessage) {
    scopeId = _unwrapScopeId(scopeId);
    this.listener.onConnectionLost(
        new ADL.ConnectionLostEvent(scopeId, errCode, errMessage));
  };

  CSLA.prototype.onUserEvent = function (scopeId, userDetails) {
    scopeId = _unwrapScopeId(scopeId);
    this.listener.onUserEvent(
        new ADL.UserStateChangedEvent(scopeId, userDetails));
  };

  CSLA.prototype.onVideoEvent = function (scopeId, userDetails) {
    scopeId = _unwrapScopeId(scopeId);
    this.listener.onMediaStreamEvent(
        new ADL.UserStateChangedEvent(
            scopeId,
            userDetails,
            ADL.MEDIA_TYPE_VIDEO)
    );
  };

  CSLA.prototype.onAudioEvent = function (scopeId, userDetails) {
    scopeId = _unwrapScopeId(scopeId);
    this.listener.onMediaStreamEvent(
        new ADL.UserStateChangedEvent(
            scopeId,
            userDetails,
            ADL.MEDIA_TYPE_AUDIO)
    );
  };

  CSLA.prototype.screenPublished = function (scopeId, userId, isPublished, sinkId) {
    scopeId = _unwrapScopeId(scopeId);
    var userDetails = {
      id:userId,
      screenPublished:isPublished,
      screenSinkId:sinkId
    };
    this.listener.onMediaStreamEvent(
        new ADL.UserStateChangedEvent(
            scopeId,
            userDetails,
            ADL.MEDIA_TYPE_SCREEN)
    );
  };

  CSLA.prototype.micActivity = function (activity) {
    this.listener.onMicActivity(new ADL.MicActivityEvent(activity));
  };

  CSLA.prototype.spkActivity = function (activity) {
//    Just ignore
  };

  CSLA.prototype.micGain = function (gain) {
    this.listener.onMicGain(new ADL.MicGainEvent(gain));
  };

  CSLA.prototype.deviceListChanged = function (audioIn, audioOut, videoIn) {
    this.listener.onDeviceListChanged(
        new ADL.DeviceListChangedEvent(audioIn, audioOut, videoIn));
  };

  CSLA.prototype.newVideoStats = function (scopeId, userId, stats) {
    scopeId = _unwrapScopeId(scopeId);
    if (userId === -1) {
      userId = undefined;
    }
    this.listener.onMediaStats(
        new ADL.MediaStatsEvent(scopeId, ADL.MEDIA_TYPE_VIDEO, stats, userId));
  };

  CSLA.prototype.newAudioStats = function (scopeId, userId, stats) {
    scopeId = _unwrapScopeId(scopeId);
    if (userId === -1) {
      userId = undefined;
    }
    this.listener.onMediaStats(
        new ADL.MediaStatsEvent(scopeId, ADL.MEDIA_TYPE_AUDIO, stats, userId));
  };

  CSLA.prototype.newScreenStats = function (scopeId, userId, stats) {
    scopeId = _unwrapScopeId(scopeId);
    if (userId === -1) {
      userId = undefined;
    }
    this.listener.onMediaStats(
        new ADL.MediaStatsEvent(scopeId, ADL.MEDIA_TYPE_SCREEN, stats, userId));
  };

  CSLA.prototype.onBroadcast = function (srcUserId, data) {
    this.listener.onMessage(new ADL.MessageEvent(srcUserId, data));
  };

  CSLA.prototype.serviceInvalidated = function () {
    this.listener.onServiceInvalidated();
  };

  CSLA.prototype.serviceRevalidated = function () {
    this.listener.onServiceRevalidated();
  };

  CSLA.prototype.newMediaConnectionType =
      function (scopeId, mediaType, connectionType) {
        scopeId = _unwrapScopeId(scopeId);
        if (mediaType === 'AUDIO') {
          mediaType = ADL.MEDIA_TYPE_AUDIO;
        } else if (mediaType === 'VIDEO') {
          mediaType = ADL.MEDIA_TYPE_VIDEO;
        }
        this.listener.onMediaConnTypeChanged(
            new ADL.MediaConnTypeChangedEvent(
                scopeId,
                mediaType,
                connectionType));
      };

  CSLA.prototype.onEchoNotification =
      function (echoedValue) {
        this.listener.onEchoNotification(echoedValue);
      };


  /**
   *
   * @param scopeId
   * @return {String}
   * @private
   */
  function _wrapScopeId(scopeId) {
    return scopeId;
  }

  /**
   *
   * @param url
   * @return {String}
   * @private
   */
  function _wrapURL(url) {
    return url;
  }

  /**
   *
   * @param scopeId
   * @private
   */
  function _unwrapScopeId(scopeId) {
    return scopeId;
  }

  function _getScopeFromURL(url) {
    var endpoint = url.substring(0, url.indexOf('/')),
        scopeId = url.substring(url.indexOf('/') + 1, url.length);
    return scopeId;
  }

  function _sanitizeConnectionDescriptor(responder, connDescriptor) {
    for (var i = 0; i < _CONN_DESCR_SANITIZERS.length; i++) {
      if (!_CONN_DESCR_SANITIZERS[i](responder, connDescriptor)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Makes sure that the token is properly defined
   *
   * @param listener
   * @param connDescriptor
   * @return {Boolean}
   * @private
   */
  function _sanitizeToken(listener, connDescriptor) {
    if(connDescriptor.token) {
      connDescriptor.token += '';
    }
    return true;
  }


  /**
   * Makes sure that the connection descriptor URL is properly defined.
   *
   * @param listener
   * @param connDescriptor
   * @return {Boolean}
   * @private
   */
  function _sanitizeConnDescriptorURL(responder, connectionDescription) {
    var scopeId;
    if (connectionDescription.url) {
//      Add the client id to the URL given
      connectionDescription.url = _wrapURL(connectionDescription.url);
      var u = connectionDescription.url;
      scopeId = u.substring(u.indexOf('/') + 1, u.length);
    } else {
//      Check if scope id is defined
      if (connectionDescription.scopeId) {
//        Construct the url using the scope id
        scopeId = connectionDescription.scopeId;
        connectionDescription.url =
            ADL._getStreamerEndpoint(connectionDescription.scopeId) +
                '/' + _wrapScopeId(connectionDescription.scopeId);
      }
      else {
//        Report an error, either scopeId or url must be given.
        responder.error(
            ADL.ErrorCodes.Logic.LOGIC_INVALID_ARGUMENT,
            'Cannot connect as neither scopeId or url not given in the ' +
                'connection descriptor.');
        return false;
      }
    }
    return true;
  }

  var _CONN_DESCR_SANITIZERS = [
    _sanitizeConnDescriptorURL,
    _sanitizeToken
  ];

}());
/**
 * Copyright (C) SayMama Ltd 2012
 *
 * All rights reserved. Any use, copying, modification, distribution and selling
 * of this software and it's documentation for any purposes without authors'
 * written permission is hereby prohibited.
 */
/**
 * @fileoverview
 * AddLive Service notifications handling facility.
 *
 * @author Tadeusz Kozak
 * @date 28-05-2012 20:04
 */

(function () {
  'use strict';
  /**
   * Defines all methods expected by the AddLiveService to dispatch notifications.
   *
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#addServiceListener
   * @constructor
   */
  ADL.AddLiveServiceListener = function () {
  };

  /**
   * Called to notify about change of spatial resolution of video feed, produced
   * by video sink with given id.
   *
   * @since 1.15.0.0
   * @see ADL.VideoFrameSizeChangedEvent
   * @param {ADL.VideoFrameSizeChangedEvent} e
   *          Event object describing the change event.
   */
  ADL.AddLiveServiceListener.prototype.onVideoFrameSizeChanged = function (e) {
  };


  /**
   * Called to notify about lost connection for scope with given id.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#connect
   * @param {ADL.ConnectionLostEvent} e
   *          Object describing the connection lost event.
   */
  ADL.AddLiveServiceListener.prototype.onConnectionLost = function (e) {
  };


  /**
   * Called to notify about connectivity status change of a remote scope
   * participant. It is called whenever new remote participant joins media scope
   * or present one just left it.
   * @since 1.15.0.0
   * @see ADL.AddLiveServiceListener#onVideoEvent
   * @see ADL.AddLiveServiceListener#onAudioEvent
   * @see ADL.UserStateChangedEvent
   * @param {ADL.UserStateChangedEvent} e
   *      Event describing the change in user connectivity status.
   */
  ADL.AddLiveServiceListener.prototype.onUserEvent = function (e) {
  };

  /**
   * Called to notify about media streaming status change for given user.
   * Streaming status change may mean either that user started or stopped
   * publishing the stream of given media (audio, video, screen).
   *
   * @since 1.15.0.0
   * @see ADL.AddLiveService#publishVideo()
   * @see ADL.AddLiveService#unpublishVideo()
   * @see ADL.AddLiveService#publishAudio()
   * @see ADL.AddLiveService#unpublishAudio()
   * @see ADL.AddLiveService#publish()
   * @see ADL.AddLiveService#unpublish()
   * @see ADL.AddLiveServiceListener#onUserEvent
   * @see ADL.AddLiveServiceListener#onAudioEvent
   *      onAudioEvent()
   * @param {ADL.UserStateChangedEvent} e
   *          Event describing the change in remote peers video streaming status.
   */
  ADL.AddLiveServiceListener.prototype.onMediaStreamEvent = function (e) {
  };


  /**
   * Reports audio capture device activity (a.k.a. speech level).
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#monitorMicActivity
   * @see ADL.AddLiveServiceListener#spkActivity
   * @param {ADL.MicActivityEvent} e
   *          Event describing the activity change;
   */
  ADL.AddLiveServiceListener.prototype.onMicActivity = function (e) {
  };

  /**
   * Reports changes in audio capture device gain, done by the
   * Automatic Gain Control subsystem.
   *
   * @since 1.0.0.0
   * @param {ADL.MicGainEvent} e
   *          Event describing the change in gain level.
   */
  ADL.AddLiveServiceListener.prototype.onMicGain = function (e) {
  };


  /**
   * Callback reporting that there was a change in hardware devices
   * configuration - it indicates that device was plugged or unplugged from
   * user's computer.
   *
   * @since 1.0.0.0
   * @param {ADL.DeviceListChangedEvent} e
   *          Event describing the change.
   */
  ADL.AddLiveServiceListener.prototype.onDeviceListChanged = function (e) {
  };


  /**
   * Reports availability of new video stream statistics for connection to media
   * scope with given id.
   *
   * @since 1.0.0.0
   * @see ADL.AddLiveService#startMeasuringStatistics
   * @param {ADL.MediaStatsEvent} e
   *          Event object
   */
  ADL.AddLiveServiceListener.prototype.onMediaStats = function (e) {
  };

  /**
   * Reports new message sent from a remote peer.
   *
   * @since 1.15.0.0
   * @see ADL.AddLiveService#sendMessage
   * @see ADL.MessageEvent
   * @param {ADL.MessageEvent} e
   *          Event describing the message received.
   */
  ADL.AddLiveServiceListener.prototype.onMessage = function (e) {
  };


  /**
   * Indicates that there is an pending update process, which forced the service
   * invalidation. Any call to the invalidate service will return an error.
   * Service becomes available again, after receiving the serviceRevalidated()
   * notification.
   *
   * @see ADL.AddLiveServiceListener#serviceRevalidated
   * @see ADL.AddLivePlugin.update
   */
  ADL.AddLiveServiceListener.prototype.onServiceInvalidated = function () {
  };

  /**
   * Indicates that update process was complete and service is again
   * fully-functional. and up to date.
   *
   * @see ADL.AddLiveServiceListener#serviceRevalidated
   * @see ADL.AddLivePlugin.update
   */
  ADL.AddLiveServiceListener.prototype.onServiceRevalidated = function () {
  };

  /**
   * Informs about change in media connection type for given scope and media
   * stream. It's purpose is solely informational.
   *
   * @since 1.15.0.0
   * @see ADL.MediaConnTypeChangedEvent
   * @param {ADL.MediaConnTypeChangedEvent} e
   *          Event describing the change.
   */
  ADL.AddLiveServiceListener.prototype.onMediaConnTypeChanged = function (e) {
  };



  /**
   * Event corresponding to change of size of video sink.
   *
   * @since 1.0.0.0
   * @param {string} sinkId
   *          Id of video sink which resolution has changed.
   * @param {Number} width
   *          New width of the feed.
   * @param {Number} height
   *          New width of the feed.
   * @constructor
   */
  ADL.VideoFrameSizeChangedEvent = function (sinkId, width, height) {

    /**
     * The type of this event.
     *
     *
     * @type {string}
     */
    this.type = 'VideoFrameSizeChangedEvent';

    /**
     * Id of video sink which resolution has changed.
     *
     *
     * @type {string}
     */
    this.sinkId = sinkId;

    /**
     * New width of the video feed provided by the sink.
     *
     *
     * @type {Number}
     */
    this.width = width;

    /**
     * New height of the video feed provided by the sink.
     *
     *
     * @type {Number}
     */
    this.height = height;
  };

  /**
   * Class describing connection lost event.
   *
   * @since 1.15.0.0
   * @param {string} scopeId
   *          id of scope which lost connection
   * @param {Number} errCode
   *          error code identifying the cause. Possible values are:
   *          - SMERR_COMM_REMOTE_END_DIED (2006)
   *            Indicates that the management connection failed to communicate
   *            with the streamer. This may be due to user's computer losing
   *            Internet connection or problems with the streaming server.
   * @param {string} errMessage
   *          additional human readable error message describing in a more detail
   *          cause of the problem.
   * @constructor
   */
  ADL.ConnectionLostEvent = function (scopeId, errCode, errMessage) {
    /**
     * The type of this event.
     *
     *
     * @type {string}
     */
    this.type = 'ConnectionLostEvent';

    /**
     * Id of scope to which this event refers.
     *
     *
     * @type {string}
     */
    this.scopeId = scopeId;

    /**
     * Error code identifying the cause of connection loss.
     *
     * @see ADL.ErrorCodes.Communication
     *
     * @type {Number}
     */
    this.errCode = errCode;

    /**
     * Additional, human-readable error message.
     *
     *
     * @type {string}
     */
    this.errMessage = errMessage;
  };


  /**
   * Event class describing change in media streaming status of a remote peer.
   * This includes: user joining media scope, user leaving media scope, user
   * publishing or stop publishing any of possible media streams.
   *
   * @since 1.15.0.0
   * @see ADL.AddLiveServiceListener#onUserEvent
   * @see ADL.AddLiveServiceListener#onMediaStreamEvent
   * @param {string} scopeId
   *          Id of media scope to which this event corresponds.
   * @param {Object} userDetails
   *          Describes most recent state of the user state.
   * @param {string=} mediaType
   *          Type of media to which this event corresponds. Might be undefined if
   *          this event is related to the user connection status.
   * @constructor
   */
  ADL.UserStateChangedEvent = function (scopeId, userDetails, mediaType) {

    /**
     * The type of this event.
     *
     *
     * @type {string}
     */
    this.type = 'UserStateChangedEvent';

    /**
     * Id of scope to which this event refers.
     *
     *
     * @type {string}
     */
    this.scopeId = scopeId;

    /**
     * Id of the user to which this events refer.
     *
     * @type {Number}
     */
    this.userId = userDetails.id || userDetails.userId;


    /**
     * Type of media to which this event refer. Undefined if it's used to notify
     * about remote user's connection state changed.
     *
     * @see ADL.MEDIA_TYPE_AUDIO
     * @see ADL.MEDIA_TYPE_VIDEO
     * @see ADL.MEDIA_TYPE_SCREEN
     *
     * @type {string|undefined}
     */
    this.mediaType = mediaType;

    /**
     * Flag defining whether the remote user joins or leaves the media scope.
     *
     *
     * @type {boolean}
     */
    this.isConnected = userDetails.isConnected;

    /**
     * Flag defining whether the remote user published audio stream or not.
     *
     *
     * @type {boolean}
     */
    this.audioPublished = userDetails.audioPublished;

    /**
     * Flag defining whether the remote user published video stream or not.
     *
     *
     * @type {boolean}
     */
    this.videoPublished = userDetails.videoPublished;

    /**
     * Flag defining whether the remote user published screen sharing stream or
     * not.
     *
     *
     * @type {boolean}
     */
    this.screenPublished = userDetails.screenPublished;

    /**
     * The id of the video sink which should be used to render remote user's
     * video feed. Set only if the __videoPublished__ is true.
     *
     *
     * @type {string}
     */
    this.videoSinkId = userDetails.videoSinkId;

    /**
     * The id of the video sink which should be used to render remote user's
     * screen sharing feed. Set only if the __videoPublished__ is true.
     *
     *
     * @type {string}
     */
    this.screenSinkId = userDetails.screenSinkId;
  };

  /**
   * Describes change in local audio capture device activity change.
   *
   * @since 1.15.0.0
   * @see ADL.AddLiveServiceListener#onMicActivity
   * @param {Number} activity integer with value in range 0-255 indicating current speech
   *                 level (higher the value is, the louder input was received
   *                 by the microphone)
   * @constructor
   */
  ADL.MicActivityEvent = function (activity) {

    /**
     * The type of this event.
     *
     *
     * @type {string}
     */
    this.type = 'MicActivityEvent';

    /**
     * New microphone activity. Value in range 0-255.
     *
     *
     * @type {Number}
     */
    this.activity = activity;
  };

  /**
   * Describe a change in audio capture device gain level.
   *
   * @since 1.15.0.0
   * @see ADL.AddLiveServiceListener#onMicGain
   * @param {Number} gain
   *          Defines new gain level. It's values are in range 0-255.
   * @constructor
   */
  ADL.MicGainEvent = function (gain) {

    /**
     * The type of this event.
     *
     *
     * @type {string}
     */
    this.type = 'MicGainEvent';

    /**
     * New microphone gain. Value in range 0-255.
     *
     *
     * @type {Number}
     */
    this.gain = gain;
  };

  /**
   * Event describing the change in hardware devices configuration.
   *
   * @since 1.15.0.0
   * @param {boolean} audioIn
   *          Flag defining whether there was a change in audio capture devices
   *          list.
   * @param {boolean} audioOut
   *          Flag defining whether there was a change in audio output devices
   *          list.
   * @param {boolean} videoIn
   *          Flag defining whether there was a change in video capture devices
   *          list.
   * @constructor
   */
  ADL.DeviceListChangedEvent = function (audioIn, audioOut, videoIn) {

    /**
     * The type of this event.
     *
     *
     * @type {string}
     */
    this.type = 'DeviceListChangedEvent';

    /**
     * Flag defining whether there was a change in audio capture devices
     * list.
     *
     *
     * @type {boolean}
     */
    this.audioInChanged = audioIn;


    /**
     * Flag defining whether there was a change in audio output devices
     * list.
     *
     *
     * @type {boolean}
     */
    this.audioOutChanged = audioOut;

    /**
     * Flag defining whether there was a change in video capture devices
     * list.
     *
     *
     * @type {boolean}
     */
    this.videoInChanged = videoIn;
  };


  /**
   * Described availability of new media stats related to media of particular type
   * and optinaly remote user.
   *
   * @since 1.15.0.0
   * @see ADL.AddLiveServiceListener#onMediaStats
   * @param {string} scopeId
   *          Id of scope in context of which stats were published
   * @param {string} mediaType
   *          Type of media described by the stats
   * @param {Object} stats
   *          object containing the detailed statistics.
   * @param {Number=} remoteUserId
   *          Optional identifier of remote user in context of which stats were
   *          published. Should be omitted if stats describe state of up-link.
   * @constructor
   */
  ADL.MediaStatsEvent = function (scopeId, mediaType, stats, remoteUserId) {
    /**
     * The type of this event.
     *
     *
     * @type {string}
     */
    this.type = 'MediaStatsEvent';

    /**
     * Id of scope to which this event refers.
     *
     *
     * @type {string}
     */
    this.scopeId = scopeId;

    /**
     * Type of media to which this event refer. Undefined if it's used to notify
     * about remote user's connection state changed.
     *
     * @see ADL.MEDIA_TYPE_AUDIO
     * @see ADL.MEDIA_TYPE_VIDEO
     * @see ADL.MEDIA_TYPE_SCREEN
     *
     * @type {string}
     */
    this.mediaType = mediaType;

    /**
     * The stats object.
     *
     *
     * @type {Object}
     */
    this.stats = stats;

    /**
     * Id of remote users to which stats refer to. Undefined if stats describes
     * the uplink channel.
     *
     *
     * @type {Number|undefined|null}
     */
    this.remoteUserId = remoteUserId;
  };

  /**
   * Describes new message sent from a remote peer event.
   *
   * @since 1.15.0.0
   * @see ADL.AddLiveService#sendMessage
   * @see ADL.AddLiveServiceListener#onMessage
   * @param {Number} srcUserId
   *          Id of user who sent the message.
   * @param {string} data
   *          Message data.
   * @constructor
   */
  ADL.MessageEvent = function (srcUserId, data) {
    /**
     * The type of this event.
     *
     *
     * @type {string}
     */
    this.type = 'MessageEvent';

    /**
     * Id of user who send the message.
     *
     *
     * @type {Number}
     */
    this.srcUserId = srcUserId;

    /**
     * Message data.
     *
     *
     * @type {string}
     */
    this.data = data;
  };

  /**
   * Describes change in media connection type for given media scope and media
   * type.
   *
   * @since 1.15.0.0
   * @param {string} scopeId
   *          scope for which media connection type changed occurred.
   * @param {string} mediaType
   *          Media type for which connection type changed. It can be either
   *          'audio', 'video' or 'screen'
   * @param {string} connectionType
   *          Describes the new connection type. It can be one of:
   *
   *          - MEDIA_TRANSPORT_TYPE_NOT_CONNECTED
   *
   *            Media transport not connected at all
   *
   *          - MEDIA_TRANSPORT_TYPE_UDP_RELAY
   *
   *            Media stream is sent/received using RTP/UDP, with
   *            help of relay server
   *
   *          - MEDIA_TRANSPORT_TYPE_UDP_P2P
   *
   *            Media stream is sent/received using RTP/UDP,
   *            directly to and from remote participant
   *
   *          - MEDIA_TRANSPORT_TYPE_TCP_RELAY
   *
   *            Media stream is sent/received using RTP/TCP, with
   *            help of relay server
   *
   * @constructor
   */
  ADL.MediaConnTypeChangedEvent = function (scopeId, mediaType, connectionType) {

    /**
     * The type of this event.
     *
     *
     * @type {string}
     */
    this.type = 'MediaConnTypeChangedEvent';

    /**
     * Id of scope to which this event refers.
     *
     *
     * @type {string}
     */
    this.scopeId = scopeId;

    /**
     * Type of media to which this event refer. Undefined if it's used to notify
     * about remote user's connection state changed.
     *
     * @see ADL.MEDIA_TYPE_AUDIO
     * @see ADL.MEDIA_TYPE_VIDEO
     * @see ADL.MEDIA_TYPE_SCREEN
     *
     * @type {string}
     */
    this.mediaType = mediaType;

    /**
     * New type of media connection established.
     *
     *
     * @type {string}
     */
    this.connectionType = connectionType;
  };
}());/*
 json2.js
 2011-10-19

 Public Domain.

 NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

 See http://www.JSON.org/js.html


 This code should be minified before deployment.
 See http://javascript.crockford.com/jsmin.html

 USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
 NOT CONTROL.


 This file creates a global JSON object containing two methods: stringify
 and parse.

 JSON.stringify(value, replacer, space)
 value       any JavaScript value, usually an object or array.

 replacer    an optional parameter that determines how object
 values are stringified for objects. It can be a
 function or an array of strings.

 space       an optional parameter that specifies the indentation
 of nested structures. If it is omitted, the text will
 be packed without extra whitespace. If it is a number,
 it will specify the number of spaces to indent at each
 level. If it is a string (such as '\t' or '&nbsp;'),
 it contains the characters used to indent at each level.

 This method produces a JSON text from a JavaScript value.

 When an object value is found, if the object contains a toJSON
 method, its toJSON method will be called and the result will be
 stringified. A toJSON method does not serialize: it returns the
 value represented by the name/value pair that should be serialized,
 or undefined if nothing should be serialized. The toJSON method
 will be passed the key associated with the value, and this will be
 bound to the value

 For example, this would serialize Dates as ISO strings.

 Date.prototype.toJSON = function (key) {
 function f(n) {
 // Format integers to have at least two digits.
 return n < 10 ? '0' + n : n;
 }

 return this.getUTCFullYear()   + '-' +
 f(this.getUTCMonth() + 1) + '-' +
 f(this.getUTCDate())      + 'T' +
 f(this.getUTCHours())     + ':' +
 f(this.getUTCMinutes())   + ':' +
 f(this.getUTCSeconds())   + 'Z';
 };

 You can provide an optional replacer method. It will be passed the
 key and value of each member, with this bound to the containing
 object. The value that is returned from your method will be
 serialized. If your method returns undefined, then the member will
 be excluded from the serialization.

 If the replacer parameter is an array of strings, then it will be
 used to select the members to be serialized. It filters the results
 such that only members with keys listed in the replacer array are
 stringified.

 Values that do not have JSON representations, such as undefined or
 functions, will not be serialized. Such values in objects will be
 dropped; in arrays they will be replaced with null. You can use
 a replacer function to replace those with JSON values.
 JSON.stringify(undefined) returns undefined.

 The optional space parameter produces a stringification of the
 value that is filled with line breaks and indentation to make it
 easier to read.

 If the space parameter is a non-empty string, then that string will
 be used for indentation. If the space parameter is a number, then
 the indentation will be that many spaces.

 Example:

 text = JSON.stringify(['e', {pluribus: 'unum'}]);
 // text is '["e",{"pluribus":"unum"}]'


 text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
 // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

 text = JSON.stringify([new Date()], function (key, value) {
 return this[key] instanceof Date ?
 'Date(' + this[key] + ')' : value;
 });
 // text is '["Date(---current time---)"]'


 JSON.parse(text, reviver)
 This method parses a JSON text to produce an object or array.
 It can throw a SyntaxError exception.

 The optional reviver parameter is a function that can filter and
 transform the results. It receives each of the keys and values,
 and its return value is used instead of the original value.
 If it returns what it received, then the structure is not modified.
 If it returns undefined then the member is deleted.

 Example:

 // Parse the text. Values that look like ISO date strings will
 // be converted to Date objects.

 myData = JSON.parse(text, function (key, value) {
 var a;
 if (typeof value === 'string') {
 a =
 /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
 if (a) {
 return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
 +a[5], +a[6]));
 }
 }
 return value;
 });

 myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
 var d;
 if (typeof value === 'string' &&
 value.slice(0, 5) === 'Date(' &&
 value.slice(-1) === ')') {
 d = new Date(value.slice(5, -1));
 if (d) {
 return d;
 }
 }
 return value;
 });


 This is a reference implementation. You are free to copy, modify, or
 redistribute.
 */

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
 call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
 getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
 lastIndex, length, parse, prototype, push, replace, slice, stringify,
 test, toJSON, toString, valueOf
 */


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
  JSON = {};
}

(function () {
  'use strict';

  function f(n) {
    // Format integers to have at least two digits.
    return n < 10 ? '0' + n : n;
  }

  if (typeof Date.prototype.toJSON !== 'function') {

    Date.prototype.toJSON = function (key) {

      return isFinite(this.valueOf())
          ? this.getUTCFullYear()     + '-' +
          f(this.getUTCMonth() + 1) + '-' +
          f(this.getUTCDate())      + 'T' +
          f(this.getUTCHours())     + ':' +
          f(this.getUTCMinutes())   + ':' +
          f(this.getUTCSeconds())   + 'Z'
          : null;
    };

    String.prototype.toJSON      =
        Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
              return this.valueOf();
            };
  }

  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta = {    // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
      },
      rep;


  function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

    escapable.lastIndex = 0;
    return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
      var c = meta[a];
      return typeof c === 'string'
          ? c
          : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
  }


  function str(key, holder) {

// Produce a string from holder[key].

    var i,          // The loop counter.
        k,          // The member key.
        v,          // The member value.
        length,
        mind = gap,
        partial,
        value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

    if (value && typeof value === 'object' &&
        typeof value.toJSON === 'function') {
      value = value.toJSON(key);
    }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

    if (typeof rep === 'function') {
      value = rep.call(holder, key, value);
    }

// What happens next depends on the value's type.

    switch (typeof value) {
      case 'string':
        return quote(value);

      case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

        return isFinite(value) ? String(value) : 'null';

      case 'boolean':
      case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

        return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

      case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

        if (!value) {
          return 'null';
        }

// Make an array to hold the partial results of stringifying this object value.

        gap += indent;
        partial = [];

// Is the value an array?

        if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

          length = value.length;
          for (i = 0; i < length; i += 1) {
            partial[i] = str(i, value) || 'null';
          }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

          v = partial.length === 0
              ? '[]'
              : gap
              ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
              : '[' + partial.join(',') + ']';
          gap = mind;
          return v;
        }

// If the replacer is an array, use it to select the members to be stringified.

        if (rep && typeof rep === 'object') {
          length = rep.length;
          for (i = 0; i < length; i += 1) {
            if (typeof rep[i] === 'string') {
              k = rep[i];
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        } else {

// Otherwise, iterate through all of the keys in the object.

          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

        v = partial.length === 0
            ? '{}'
            : gap
            ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
            : '{' + partial.join(',') + '}';
        gap = mind;
        return v;
    }
  }

// If the JSON object does not yet have a stringify method, give it one.

  if (typeof JSON.stringify !== 'function') {
    JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

      var i;
      gap = '';
      indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

      if (typeof space === 'number') {
        for (i = 0; i < space; i += 1) {
          indent += ' ';
        }

// If the space parameter is a string, it will be used as the indent string.

      } else if (typeof space === 'string') {
        indent = space;
      }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

      rep = replacer;
      if (replacer && typeof replacer !== 'function' &&
          (typeof replacer !== 'object' ||
              typeof replacer.length !== 'number')) {
        throw new Error('JSON.stringify');
      }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

      return str('', {'': value});
    };
  }


// If the JSON object does not yet have a parse method, give it one.

  if (typeof JSON.parse !== 'function') {
    JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

      var j;

      function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

        var k, v, value = holder[key];
        if (value && typeof value === 'object') {
          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = walk(value, k);
              if (v !== undefined) {
                value[k] = v;
              } else {
                delete value[k];
              }
            }
          }
        }
        return reviver.call(holder, key, value);
      }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

      text = String(text);
      cx.lastIndex = 0;
      if (cx.test(text)) {
        text = text.replace(cx, function (a) {
          return '\\u' +
              ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        });
      }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

      if (/^[\],:{}\s]*$/
          .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

        j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

        return typeof reviver === 'function'
            ? walk({'': j}, '')
            : j;
      }

// If the text is not JSON parseable, then a SyntaxError is thrown.

      throw new SyntaxError('JSON.parse');
    };
  }
}());/**
 * Copyright (C) SayMama Ltd 2012
 *
 * All rights reserved. Any use, copying, modification, distribution and selling
 * of this software and it's documentation for any purposes without authors'
 * written permission is hereby prohibited.
 */
/**
 * Contains implementation of the platform initialization functionality.
 *
 * This includes methods:
 *
 * CDO.initPlatform()
 * CDO.getService()
 *
 * @fileoverview
 * @author Tadeusz Kozak
 * @date 27-06-2012 13:45
 */
(function () {
  'use strict';

  var _DEFAULT_PLATFORM_INIT_OPTIONS = {
    pluginPollFrequency:500,
    initDevices:true,
    skipUpdate:false,
    updateDescriptorRoot:'',
    installationDescriptorRoot:''
  };

  /**
   *
   * @type {Number}
   * @private
   */
  var _UPDATE_BEGIN_PROGRESS = 5;

  /**
   *
   * @type {Number}
   * @private
   */
  var _UPDATE_END_PROGRESS = 70;

  var _CREATE_SERVICE_BEGIN_PROGRESS = 71;

  var _CREATE_SERVICE_END_PROGRESS = 80;

  var _INIT_COMPLETE_PROGRESS = 100;

  var _DEFAULT_CLIENT_ID = 1;

  /**
   * Initializes the AddLive Platform.
   *
   * @since 1.16.0.0
   * @see ADL.PlatformInitListener
   * @see ADL.getService
   * @param {ADL.PlatformInitListener} listener
   *          Listener that will receive the init state change notifications.
   * @param {Object} [options]
   *          Client id or fine fine configuration options (includes client id)
   * @param {Number} [options.clientId]
   *          @deprecated
   *          AddLive client id. Affects use of custom installation binaries
   *          and streamer URLs resolving.
   * @param {Number} [options.applicationId]
   *          Id of AddLive application. Affects use of custom installation
   *          binaries and streamer URLs employed. Defines global application
   *          context.
   * @param {Number} [options.pluginPollFrequency=500]
   *          Defines how frequently the SDK should check the plug-in
   *          availability after dispatching the
   *          CDO.InitState.INSTALLATION_REQUIRED state changed notification.
   * @param {Boolean} [options.initDevices=true]
   *          Flag defining whether the devices initialization should be
   *          performed or not. Defaults to true.
   * @param {Boolean} [options.skipUpdate=false]
   *          Flag defining whether the self-update process should be skipped
   *          or not.
   * @param {string} [options.updateDescriptorRoot]
   *          Custom root for update descriptors used with self updating
   * @param {string} [options.installationDescriptorRoot]
   *          Custom root for update descriptors used with installation.
   */
  ADL.initPlatform = function (listener, options) {
    ADL._logd("Initializing the platform");
    _validatePlatformOptions(options);

    /**
     *
     * @type {Object}
     * @private
     */
    ADL._platformOptions = {};
    ADL._mergeObj(ADL._platformOptions, _DEFAULT_PLATFORM_INIT_OPTIONS);
    ADL._platformOptions.updateDescriptorRoot = ADL._PLUGIN_UPDATE_ROOT;
    ADL._platformOptions.installationDescriptorRoot = ADL._PLUGIN_INSTALL_ROOT;
    /**
     *
     * @type {Number}
     * @private
     */
    ADL._clientId = _DEFAULT_CLIENT_ID;

//    Platform configuration setup
    if (options) {
      if (typeof options === 'number') {
        ADL._clientId = options;
      } else {
//        Overwrite only defined properties
        ADL._mergeObj(ADL._platformOptions, options);
        if (options.clientId !== undefined) {
          ADL._clientId = options.clientId;
        }
      }
    }

//    Synchronous steps.
    var pluginContainerId = _embedPluginContainer();
    var pluginInstalled = _embedPlugin();

//    Rest is done asynchronously.
    if (pluginInstalled) {
      if (ADL._platformOptions.skipUpdate) {
//        The update was skipped, so create the service directly.
        ADL._logw("AddLive Plug-in update was skipped. Do this only if you " +
            "know what you're doing.");
        _createService(listener);
      } else {
//      Do the update, then create the service and perform quick devices
//      initialization.
        _updatePlugin(listener);
      }
    } else {
//      Fetch the update descriptor and report that plug-in needs to be
//      installed.
      _getInstallURL(listener);
    }
  };

  /**
   * Returns the AddLiveService created and initialized by the CDO.initPlatform.
   * If the AddLivePlatform was not initialized prior to calling this function,
   * it will return undefined value.
   *
   * @since 1.16.0.0
   * @see ADL.initPlatform
   * @returns {ADL.AddLiveService}
   */
  ADL.getService = function () {
    return ADL._service;
  };

  /**
   * Disposes the previously initialized AddLive Platform. Internally it
   * deletes the AddLive Service instance and removes the object tag from DOM.
   *
   * @since 1.17.1
   * @see ADL.initPlatform
   */
  ADL.disposePlatform = function () {
    ADL._logd("Disposing platform");
    delete ADL._service;
    ADL._pluginInstance.unload();
    var pContainer = document.getElementById(ADL._pluginContainerId);
    pContainer.parentNode.removeChild(pContainer);
    delete ADL._pluginInstance;
  };

  /**
   * Listener interface for handling platform initialization events.
   *
   * @since 1.16.0.0
   * @see ADL.initPlatform
   * @constructor
   */
  ADL.PlatformInitListener = function () {
  };

  /**
   * Called whenever the initialization state changes.
   *
   * @since 1.16.0.0
   * @param {ADL.InitStateChangedEvent} event
   */
  ADL.PlatformInitListener.prototype.onInitStateChanged = function (event) {
  };

  /**
   * Called whenever the initialization progress value changes.
   *
   * @since 1.16.0.0
   * @param {ADL.InitProgressChangedEvent} event
   */
  ADL.PlatformInitListener.prototype.onInitProgressChanged = function (event) {
  };

  /**
   * Event describing change in the platform initialization state.
   *
   * @since 1.16.0.0
   * @see ADL.initPlatform
   * @see ADL.PlatformInitListener
   * @param {string} state
   *          new state of the initialization process
   * @param {string} [installerUrl]
   *          Installation URL - use this URL to show the install button.
   * @param {Number} [errCode]
   *          Optional error code, in case of state being CDO.InitState.ERROR
   * @param {string} [errMessage]
   *          Optional error message, in case of state being CDO.InitState.ERROR
   *
   * @constructor
   */
  ADL.InitStateChangedEvent = function (state, installerUrl, errCode, errMessage, failSafeInstallerURL) {

    /**
     * New initialization state
     *
     * @see ADL.InitState
     * @type {string}
     */
    this.state = state;

    /**
     * Optional error code, in case of state being CDO.InitState.ERROR
     *
     * @type {Number}
     */
    this.errCode = errCode;

    /**
     * Optional error message, in case of state being CDO.InitState.ERROR
     *
     * @type {string}
     */
    this.errMessage = errMessage;

    /**
     * Optional installation URL. Defined only if the state is equal to
     * CDO.InitState.INSTALLATION_REQUIRED, and should be used as a href in
     * installation link/button.
     *
     * @type {string}
     */
    this.installerURL = installerUrl;

    /**
     * Flag defining whether video capture device was properly initialized.
     * Defined only when the status == CDO.InitState.INITIALIZED.
     *
     * @since 1.17.4
     * @type {Boolean}
     */
    this.videoCaptureDevFunctional = false;

    /**
     * Flag defining whether audio capture device was properly initialized.
     * Defined only when the status == CDO.InitState.INITIALIZED.
     *
     * @since 1.17.4
     * @type {Boolean}
     */
    this.audioCaptureDevFunctional = false;

    /**
     * Flag defining whether audio output device was properly initialized.
     * Defined only when the status == CDO.InitState.INITIALIZED.
     *
     * @since 1.17.4
     * @type {Boolean}
     */
    this.audioOutputDevFunctional = false;

  };

  /**
   * Event describing change in AddLive Platform initialization progress.
   *
   * @since 1.16.0.0
   * @see ADL.initPlatform
   * @see ADL.PlatformInitListener#onInitProgressChanged
   * @param {Number} progress
   * @constructor
   */
  ADL.InitProgressChangedEvent = function (progress) {

    /**
     * New progress value, with values in range [0;100];
     * @type {Number}
     */
    this.progress = progress;
  };

  /**
   * Enumeration listing all possible platform initialization states.
   *
   * @since 1.16.0.0
   * @see ADL.initPlatform
   * @see ADL.PlatformInitListener#onInitStateChanged
   * @see ADL.InitStateChangedEvent
   * @enum {string}
   */
  ADL.InitState = {

    /**
     * Indicates that there was an error with platform initialization.
     */
    ERROR:'ERROR',

    /**
     * Indicates that the platform was successfully initialized.
     */
    INITIALIZED:'INITIALIZED',

    /**
     * Indicates that due to an auto update, the browser needs to be restarted.
     */
    BROWSER_RESTART_REQUIRED:'BROWSER_RESTART_REQUIRED',

    /**
     * Indicates that the AddLive Plug-in needs to be installed. It does not
     * break the initialization process, the platform will internally start
     * polling for the plug-in availability and when detected, will continue
     * with the initialization.
     */
    INSTALLATION_REQUIRED:'INSTALLATION_REQUIRED',

    /**
     * Indicates that the user has finished with the AddLive Plug-in
     * installation, and the platform continues to initialize itself.
     */
    INSTALLATION_COMPLETE:'INSTALLATION_COMPLETE',

    /**
     * Indicates that the AddLive Service self-update process has just begun.
     */
    UPDATE_BEGIN:'UPDATE_STARTED',

    /**
     * Indicates that the media devices initialization process has just begun.
     */
    DEVICES_INIT_BEGIN:'DEVICES_INIT_STARTED'

  };

  /**
   * ===========================================================================
   * Private helpers
   * ===========================================================================
   */

  /**
   *
   * @private
   */
  function _embedPluginContainer() {
    var pluginContainer = document.createElement('div');
    pluginContainer.style.position = 'fixed';
    pluginContainer.style.overflow = 'hidden';
    pluginContainer.style.width = 10;
    pluginContainer.style.height = 10;
    pluginContainer.style.top = 0;
    pluginContainer.style.left = -100;
    pluginContainer.id = 'addLivePluginContainer' + _generateRandomIdSuffix();
    document.body.appendChild(pluginContainer);
    ADL._pluginContainerId = pluginContainer.id;
  }

  /**
   *
   * @private
   */
  function _embedPlugin() {
    ADL._logd("Embedding the AddLive plugin inside a container with id: " +
        ADL._pluginContainerId);
    ADL._pluginInstance = new ADL.AddLivePlugin(ADL._pluginContainerId);
    return ADL._pluginInstance.loadPlugin();
  }

  /**
   *
   * @param {ADL.PlatformInitListener} listener
   * @private
   */
  function _updatePlugin(listener) {
    var updateListener = new ADL.PluginUpdateListener();
    updateListener.updateProgress = function (progress) {
      var progressRange = _UPDATE_END_PROGRESS - _UPDATE_BEGIN_PROGRESS;
      var progressWeighted = _UPDATE_BEGIN_PROGRESS +
          (progressRange * progress / 100);
      this.initListener.onInitProgressChanged(
          new ADL.InitProgressChangedEvent(progressWeighted));
    };

    updateListener.updateStatus = function (status, errCode, error) {
      var initListener = this.initListener;
      switch (status) {
        case 'UPDATING':
//          Update process started - ignore
          initListener.onInitStateChanged(
              new ADL.InitStateChangedEvent(ADL.InitState.UPDATE_BEGIN));
          break;
        //noinspection FallthroughInSwitchStatementJS
        case 'UPDATED':
        case 'UP_TO_DATE':
//        Plugin up to date - nothing needs to be done
          _createService(initListener);
          break;
        case 'UPDATED_RESTART':
//            Report that the initialization is complete
          initListener.onInitProgressChanged(
              new ADL.InitProgressChangedEvent(_INIT_COMPLETE_PROGRESS));

//            Report that the browser needs to be restarted
          initListener.onInitStateChanged(
              new ADL.InitStateChangedEvent(
                  ADL.InitState.BROWSER_RESTART_REQUIRED));
//        Plugin updated successfully but browser needs to be restarted
          break;
        case 'NEEDS_MANUAL_UPDATE':
//        Plugin needs re-installation
          break;
        case 'ERROR':
          ADL._loge("Failed to update the plug-in. Proceeding with the " +
              "initialization using the old one.");
          initListener._updateFailed = true;
          _createService(initListener);
//        Failed to update the plugin.
          break;
        default:
          break;
      }

    };

    updateListener.initListener = listener;
    listener.onInitProgressChanged(
        new ADL.InitProgressChangedEvent(_UPDATE_BEGIN_PROGRESS));
    ADL._pluginInstance.update(updateListener);
  }

  function _getInstallURL(listener) {
    var succHandler = function (url, failSafeUrl) {
      listener.onInitStateChanged(
          new ADL.InitStateChangedEvent(
              ADL.InitState.INSTALLATION_REQUIRED,
              url,
              undefined,
              undefined,
              failSafeUrl
          ));
      ADL._pluginInstance.startPolling(_getPollingHandler(listener),
          ADL._platformOptions.pluginPollFrequency);
    };
    var errHandler = function (errCode, errMessage) {
      listener.onInitStateChanged(
          new ADL.InitStateChangedEvent(
              ADL.InitState.ERROR, undefined, errCode, errMessage));
    };
    var installUpdateDescriptor =
        ADL.getInstallerURL(ADL.createResponder(succHandler, errHandler));
  }


  function _createService(listener) {
    listener.onInitProgressChanged(
        new ADL.InitProgressChangedEvent(_CREATE_SERVICE_BEGIN_PROGRESS));

    var createServiceResultHandler = function (service) {
      listener.onInitProgressChanged(
          new ADL.InitProgressChangedEvent(_CREATE_SERVICE_END_PROGRESS));

      /**
       *
       * @type {ADL.AddLiveService}
       * @private
       */
      ADL._service = service;
      _setAppIdMaybe();
      _initDevicesMaybe(listener);
    };

    var createServiceErrorHandler = function (errCode, errMessage) {

      listener.onInitProgressChanged(
          new ADL.InitProgressChangedEvent(_INIT_COMPLETE_PROGRESS));
      listener.onInitStateChanged(
          new ADL.InitStateChangedEvent(ADL.InitState.ERROR, undefined,
              errCode, errMessage)
      );
    };

    ADL._pluginInstance.createService(
        ADL.createResponder(
            createServiceResultHandler,
            createServiceErrorHandler
        )
    );

  }

  function _initDevicesMaybe(listener) {
    if (ADL._platformOptions.initDevices) {
      _initDevices(listener);
    } else {
      ADL._logw("Skipping devices initialization due to " +
          "platformOptions.initDevices being false");
      listener.onInitProgressChanged(
          new ADL.InitProgressChangedEvent(_INIT_COMPLETE_PROGRESS));
      var initializedE =
          new ADL.InitStateChangedEvent(ADL.InitState.INITIALIZED);
      _applyUpdateErrorFlag(listener, initializedE);
      listener.onInitStateChanged(initializedE);
    }

  }

  function _applyUpdateErrorFlag(listener, event) {
    if (listener._updateFailed) {
      event.updateFailed = true;
    }
  }

  /**
   *
   * Sets application id if specified in platform initialization options.
   *
   * Please note that at the moment, it depends on assumption that the
   * asynchronous calls are processed in order.
   *
   * TODO remove the assumption
   * @private
   */
  function _setAppIdMaybe() {

    if(ADL._platformOptions.applicationId) {
      var onSucc = function () {
            _init
          },
          onErr = function () {
          };
      ADL._service.setApplicationId(ADL.r(onSucc, onErr),
          ADL._platformOptions.applicationId);
    }
  }


  function _initDevices(listener) {
    listener.onInitStateChanged(
        new ADL.InitStateChangedEvent(ADL.InitState.DEVICES_INIT_BEGIN));
    var stepsToComplete = 3;
    listener._currentProgress = _CREATE_SERVICE_END_PROGRESS;
    var stateChangedEvent =
        new ADL.InitStateChangedEvent(ADL.InitState.INITIALIZED);
    var stepComplete = function (devType, succ) {
      stepsToComplete--;
      stateChangedEvent[devType + 'DevFunctional'] = succ;
      if (stepsToComplete === 0) {
        delete listener._currentProgress;
        listener.onInitProgressChanged(
            new ADL.InitProgressChangedEvent(_INIT_COMPLETE_PROGRESS));
        _applyUpdateErrorFlag(listener, stateChangedEvent);
        listener.onInitStateChanged(stateChangedEvent);
      } else {
        listener._currentProgress += 5;
        listener.onInitProgressChanged(
            new ADL.InitProgressChangedEvent(listener._currentProgress));

      }
    };
    _configDeviceOfType('VideoCapture',
        ADL._CAM_CONFIG_KEY, stepComplete);

    _configDeviceOfType('AudioCapture',
        ADL._MIC_CONFIG_KEY, stepComplete);

    _configDeviceOfType('AudioOutput',
        ADL._SPK_CONFIG_KEY, stepComplete);
  }

  function _configDeviceOfType(devType, storageProperty, stepComplete) {
    var getNamesMethod = 'get' + devType + 'DeviceNames';
    var setMethod = 'set' + devType + 'Device';
    var devFunctionalLabel = devType.substring(0, 1).toLowerCase() +
        devType.substring(1);
    ADL._service[getNamesMethod](
        ADL.createResponder(
            function (devs) {
              var configuredDev = ADL._getLocalStorageProperty(storageProperty);
              if (!(configuredDev && configuredDev in devs)) {
                for (var k in devs) {
                  if (Object.prototype.hasOwnProperty.call(devs, k)) {
                    configuredDev = k;
                    ADL._setLocalStorageProperty(
                        storageProperty, configuredDev);
                    //noinspection BreakStatementJS
                    break;
                  }
                }
              }
              ADL._service[setMethod](
                  ADL.createResponder(
                      function () {
                        stepComplete(devFunctionalLabel, true);
                      },
                      function () {
                        stepComplete(devFunctionalLabel, false);
                      }
                  ),
                  configuredDev);
            },
            function (errCode, errMessage) {
              ADL._logw("Failed to initialize device of type: " + devType +
                  ' due to: ' + errMessage + '(' + errCode + ')');
              stepComplete();
            }

        )
    );
  }

  /**
   * @return {String}
   */
  function _generateRandomIdSuffix() {
    return Math.random().toString(36).substring(2, 5);
  }

  /**
   *
   * @param {ADL.PlatformInitListener} listener
   * @return {Function}
   * @private
   */
  function _getPollingHandler(listener) {
    return function () {
      listener.onInitStateChanged(
          new ADL.InitStateChangedEvent(
              ADL.InitState.INSTALLATION_COMPLETE));
      _createService(listener);
    };
  }

  /**
   *
   * @private
   */
  function _validatePlatformOptions(options) {
    if (options === undefined) {
      return;
    }
    var msg;
    if (options.pluginPollFrequency !== undefined) {
      var originalPollValue = options.pluginPollFrequency;
      options.pluginPollFrequency = parseInt(originalPollValue, 10);
      if (isNaN(options.pluginPollFrequency) ||
          options.pluginPollFrequency < 0) {
        msg = "Invalid initialization options object - invalid " +
            "pluginPollFrequency property value: " + originalPollValue;
        throw new ADL.AddLiveException(
            msg,
            ADL.ErrorCodes.Logic.LOGIC_INVALID_ARGUMENT);
      }
    }
    if (options.applicationId !== undefined) {
      var originalAppId = options.applicationId;

      options.applicationId = parseInt(originalAppId, 10);
      if (isNaN(options.applicationId)) {
        msg = "Invalid initialization options object - invalid " +
            "application id property value: " + originalAppId;
        throw new ADL.AddLiveException(
            msg,
            ADL.ErrorCodes.Logic.LOGIC_INVALID_ARGUMENT);
      }
    }
  }

}());/**
 * Copyright (C) SayMama Ltd 2012
 *
 * All rights reserved. Any use, copying, modification, distribution and selling
 * of this software and it's documentation for any purposes without authors'
 * written permission is hereby prohibited.
 */
/**
 * @fileoverview
 * @TODO file description
 *
 * @author Tadeusz Kozak
 * @date 09-07-2012 16:57
 */



(function () {
  'use strict';

  ADL._CLIENT_ENDPOINTS = ADL._CLIENT_ENDPOINTS || {};

  /**
   * Returns a streamer endpoint to use to connect to scope with given id.
   *
   * @since 1.16.1.0
   * @return {string}
   * @private
   */
  ADL._getStreamerEndpoint = function (scopeId) {
    if(ADL._CLIENT_ENDPOINTS[ADL._clientId] === undefined) {
      ADL._logw("Failed to find a streamer endpoint for client");
      return ADL._DEFAULT_STREAMER_ENDPOINT;
    } else {
      return ADL._CLIENT_ENDPOINTS[ADL._clientId];
    }
  };


})();/**
 * Copyright (C) SayMama Ltd 2012
 *
 * All rights reserved. Any use, copying, modification, distribution and selling
 * of this software and it's documentation for any purposes without authors'
 * written permission is hereby prohibited.
 */
/**
 * @fileoverview
 * Contains definition of  the CDO.MediaConnction class.
 *
 * @author Tadeusz Kozak
 * @date 11-07-2012 14:34
 */


(function () {
  'use strict';

  /**
   * Class representing an established media connection. Allows an easier
   * management of the connection by providing helper publish*, unpublish* and
   * disconnect methods.
   *
   * @see ADL.AddLiveService#connect
   * @see ADL.AddLiveService#disconnect
   * @see ADL.AddLiveService#publish
   * @see ADL.AddLiveService#unpublish
   * @see ADL.AddLiveService#sendMessage
   * @since 1.16.1.1
   * @param {string} scopeId
   *          Id of media scope represented by this instance of the
   *          MediaConnection.
   * @constructor
   */
  ADL.MediaConnection = function (scopeId) {

    /**
     * Id of scope managed by this MediaConnection
     * @type {String}
     */
    this.scopeId = scopeId;
  };


  /**
   * Publishes a stream of given type in a specified way
   *
   * @since 1.16.1.1
   * @see ADL.AddLiveService#publish
   * @see ADL.MediaType
   * @param {ADL.Responder} responder
   *          Result and error handler.
   * @param {string} what
   *          Type of media to publish, one of the CDO.MediaType values.
   * @param {Object} [how]
   *          Optional object defining additional publishing configuration.
   */
  ADL.MediaConnection.prototype.publish = function (responder, what, how) {
    ADL.getService().publish(responder, this.scopeId, what, how);
  };

  /**
   * Stops publishing stream of given type
   *
   * @see ADL.AddLiveService#unpublish
   * @see ADL.MediaType
   * @param {ADL.Responder} responder
   *          Result and error handler.
   * @param {string}what
   *          Type of media to publish, one of the CDO.MediaType values.
   */
  ADL.MediaConnection.prototype.unpublish = function (responder, what) {
    ADL.getService().unpublish(responder, this.scopeId, what);
  };

  /**
   * Publishes the audio stream.
   *
   * @since 1.16.1.1
   * @see ADL.AddLiveService#publish
   * @see ADL.MediaType.AUDIO
   * @param {ADL.Responder} responder
   *          Result and error handler.
   */
  ADL.MediaConnection.prototype.publishAudio = function (responder) {
    this.publish(responder, ADL.MediaType.AUDIO);
  };

  /**
   * Stops publishing the audio stream.
   *
   * @since 1.16.1.1
   * @see ADL.AddLiveService#publish
   * @see ADL.MediaType.AUDIO
   * @param {ADL.Responder} responder
   *          Result and error handler.
   */
  ADL.MediaConnection.prototype.unpublishAudio = function (responder) {
    this.unpublish(responder, ADL.MediaType.AUDIO);
  };

  /**
   * Publishes the video stream.
   *
   * @since 1.16.1.1
   * @see ADL.AddLiveService#publish
   * @see ADL.MediaType.VIDEO
   * @param {ADL.Responder} responder
   *          Result and error handler.
   */
  ADL.MediaConnection.prototype.publishVideo = function (responder) {
    this.publish(responder, ADL.MediaType.VIDEO);
  };

  /**
   * Stops publishing the video stream.
   *
   * @since 1.16.1.1
   * @see ADL.AddLiveService#unpublish
   * @see ADL.MediaType.VIDEO
   * @param {ADL.Responder} responder
   *          Result and error handler.
   */
  ADL.MediaConnection.prototype.unpublishVideo = function (responder) {
    this.unpublish(responder, ADL.MediaType.VIDEO);
  };

  /**
   * Publishes the screen sharing stream.
   *
   * @since 1.16.1.1
   * @see ADL.AddLiveService#publish
   * @see ADL.MediaType.SCREEN
   * @see ADL.AddLiveService#getScreenCaptureSources
   * @param {ADL.Responder} responder
   *          Result and error handler.
   * @param {number} windowId
   *          Id of screen sharing source. To be obtained using the
   *          CDO.AddLiveService.getScreenCaptureSources and selected by the
   *          user.
   * @param {number} [nativeWidth]
   *          TODO
   */
  ADL.MediaConnection.prototype.publishScreen =
      function (responder, windowId, nativeWidth) {
        if (nativeWidth === undefined) {
          nativeWidth = 640;
        }
        this.publish(responder,
                     ADL.MediaType.SCREEN,
                     {windowId:windowId, nativeWidth:nativeWidth});
      };

  /**
   * Stops publishing the screen sharing stream.
   *
   * @since 1.16.1.1
   * @see ADL.AddLiveService#unpublish
   * @see ADL.MediaType.SCREEN
   * @param {ADL.Responder} responder
   *          Result and error handler.
   */
  ADL.MediaConnection.prototype.unpublishScreen = function (responder) {
    this.unpublish(responder, ADL.MediaType.SCREEN);

  };

  /**
   * Terminates the connection maintained by this MediaConnection instance.
   *
   * @since 1.16.1.1
   * @see ADL.AddLiveService#disconnect
   * @param {ADL.Responder} responder
   *          Result and error handler.
   */
  ADL.MediaConnection.prototype.disconnect = function (responder) {
    ADL.getService().disconnect(responder, this.scopeId);
  };

  /**
   * Sends an opaque message to all peers connected to the same media scope
   * or only to the selected one.
   *
   * @since 1.16.1.1
   * @see ADL.AddLiveService#sendMessage
   * @param {ADL.Responder} responder
   *          Result and error handler.
   * @param {string} message
   *          Message to be send
   * @param {number} [targetUserId]
   *          Optional id of recipient. Don't specify if message is supposed to
   *          be broadcast to every user connected to the media scope.
   */
  ADL.MediaConnection.prototype.sendMessage =
      function (responder, message, targetUserId) {
        ADL.getService().sendMessage(responder,
                                     this.scopeId,
                                     message,
                                     targetUserId);
      };

})();/**
 * Copyright (C) SayMama Ltd 2012
 *
 * All rights reserved. Any use, copying, modification, distribution and selling
 * of this software and it's documentation for any purposes without authors'
 * written permission is hereby prohibited.
 */
/**
 * @fileoverview
 * @TODO file description
 *
 * @author Tadeusz Kozak
 * @date 06-11-2012 12:30
 */


(function (window) {

  var CDO = window.ADL;
  CDO.CloudeoService = ADL.AddLiveService;
  CDO.CloudeoServiceListener = ADL.AddLiveServiceListener;
  CDO.CloudeoException = ADL.AddLiveException;
  CDO.CloudeoPlugin = ADL.AddLivePlugin;
  window.CDO = CDO;

})(window);/**
 * Copyright (C) SayMama Ltd 2012
 *
 * All rights reserved. Any use, copying, modification, distribution and selling
 * of this software and it's documentation for any purposes without authors'
 * written permission is hereby prohibited.
 */
/**
 * @fileoverview
 * @TODO file description
 *
 * @author Tadeusz Kozak
 * @date 09-07-2012 14:34
 */

(function () {

  /**
   * Release level of this SDK.
   *
   * @since 1.16.1.0
   * @type {String}
   */
  ADL.RELEASE_LEVEL = 'beta';

  /**
   * Version of the JavaScript bindings
   * @since 1.17.0
   * @type {String}
   */
  ADL.VERSION = '1.18.0';

  /**
   *
   * @type {String}
   * @private
   */
  ADL._DEFAULT_STREAMER_ENDPOINT = '174.127.76.179:443';

  /**
   *
   * @type {String}
   * @private
   */
  ADL._PLUGIN_UPDATE_ROOT = 'http://s3.amazonaws.com/api.addlive.com/beta/';

  /**
   *
   * @type {String}
   * @private
   */
  ADL._PLUGIN_INSTALL_ROOT = 'https://s3.amazonaws.com/api.addlive.com/beta/';

})();/**
 * Copyright (C) SayMama Ltd 2012
 *
 * All rights reserved. Any use, copying, modification, distribution and selling
 * of this software and it's documentation for any purposes without authors'
 * written permission is hereby prohibited.
 */
/**
 * @fileoverview
 * @TODO file description
 *
 * @author Tadeusz Kozak
 * @date 19-07-2012 12:06
 */


(function () {

  /**
   *
   * @type {Object}
   * @private
   */
  ADL._CLIENT_ENDPOINTS = {
    1:'174.127.76.179:443',
    2:'174.127.76.179:443',
    3:'174.127.76.179:443',
    4:'174.127.76.179:443',
    5:'174.127.76.179:443',
    6:'174.127.76.179:443',
    7:'174.127.76.179:443'
  };

})();