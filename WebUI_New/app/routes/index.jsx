'use strict'

import React from 'react'
import App from '../views/Main'
import { Route, IndexRoute, browserHistory } from 'react-router'

// Login
import Login from '../components/modules/login'

// Setup Wizard
import SetupWizard from '../components/modules/setupWizard'

// System Status
import Dashboard from '../components/modules/dashboard'
import SystemInformation from '../components/modules/systemInfo'
import ActivityCall from '../components/modules/activityCall'
import NetworkStatus from '../components/modules/networkStatus'

// Extension / Trunk
import Extension from '../components/modules/extension'
import ExtensionItem from '../components/modules/extension/extensionItem'
import EditSelectedExtensions from '../components/modules/extension/editSelectedExtensions'
import ImportExtension from '../components/modules/extension/importExtension'
import ExtensionGroup from '../components/modules/extensionGroup'
import ExtensionGroupItem from '../components/modules/extensionGroup/extensionGroupItem'
import AnalogTrunk from '../components/modules/trunkAnalog'
import AnalogTrunkItem from '../components/modules/trunkAnalog/analogTrunkItem'
import DigitalTrunk from '../components/modules/trunkDigital'
import DigitalTrunkItem from '../components/modules/trunkDigital/digitalTrunkItem'
import DigitalDodTrunksList from '../components/modules/trunkDigital/dodTrunksList'
import DataTrunk from '../components/modules/trunkData'
import EditDataTrunk from '../components/modules/trunkData/editDataTrunk'
import VoIPTrunk from '../components/modules/trunkVoip'
import CreateVoipTrunk from '../components/modules/trunkVoip/createVoipTrunk'
import EditVoipTrunk from '../components/modules/trunkVoip/editVoipTrunk'
import DodTrunksList from '../components/modules/trunkVoip/dodTrunksList'
import CreateEditDodTrunk from '../components/modules/trunkVoip/createEditDodTrunk'
import SLAStation from '../components/modules/slaStation'
import SLAStationItem from '../components/modules/slaStation/slaStationItem'
import OutboundRoute from '../components/modules/outboundRoute'
import OutboundRouteItem from '../components/modules/outboundRoute/outboundRouteItem'
import OutboundBlackList from '../components/modules/outboundRoute/outboundBlackList'
import OutboundPinGroups from '../components/modules/outboundRoute/pingroups'
import OutboundPinGroupsItem from '../components/modules/outboundRoute/pingroupsItem'
import InboundRoute from '../components/modules/inboundRoute'
import InboundRouteItem from '../components/modules/inboundRoute/inboundRouteItem'
import InboundBlackList from '../components/modules/inboundRoute/inboundBlackList'
import InboundSettings from '../components/modules/inboundRoute/inboundSettings'

// Call Features
import Conference from '../components/modules/conference'
import ConferenceItem from '../components/modules/conference/conferenceItem'
import ConferenceSettings from '../components/modules/conference/conferenceSettings'
import ScheduleIndex from '../components/modules/conference/scheduleIndex'
import ScheduleSettings from '../components/modules/conference/scheduleSettings'
import CleanSettings from '../components/modules/conference/cleanSettings'
import CalendarSettings from '../components/modules/conference/calendarSettings'
import AuthSettings from '../components/modules/conference/authSettings'
import IVR from '../components/modules/ivr'
import IVRItem from '../components/modules/ivr/ivrItem'
import Voicemail from '../components/modules/voicemail'
import VoicemailEmailSettings from '../components/modules/voicemail/voicemailEmailSettings'
import VoicemailGroup from '../components/modules/voicemail/voicemailGroupSettings'
import VoicemailGroupItem from '../components/modules/voicemail/voicemailGroupItem'
import RingGroup from '../components/modules/ringGroup'
import RingGroupItem from '../components/modules/ringGroup/RingGroupItem'
import PagingIntercom from '../components/modules/pagingIntercom'
import PagingIntercomItem from '../components/modules/pagingIntercom/pagingIntercomItem'
import PagingIntercomSetting from '../components/modules/pagingIntercom/pagingIntercomSetting'
import CallQueue from '../components/modules/callQueue'
import CallQueueItem from '../components/modules/callQueue/queueItem'
import CallQueueStatistics from '../components/modules/callQueue/statistics'
import CallQueueSwitchboard from '../components/modules/callQueue/switchboard'
import AgentLoginSettings from '../components/modules/callQueue/settings'
import PickupGroup from '../components/modules/pickupGroup'
import PickupGroupItem from '../components/modules/pickupGroup/pickupGroupItem'
import DialByName from '../components/modules/dialByName'
import DialByNameItem from '../components/modules/dialByName/dialByNameItem'
import SpeedDial from '../components/modules/speedDial'
import SpeedDialItem from '../components/modules/speedDial/speedDialItem'
import DISA from '../components/modules/disa'
import DISAItem from '../components/modules/disa/disaItem'
import CallBack from '../components/modules/callback'
import CallBackItem from '../components/modules/callback/callBackItem'
import EventList from '../components/modules/eventList'
import EventListItem from '../components/modules/eventList/eventListItem'
import FeatureCode from '../components/modules/featureCode'
import ParkingLot from '../components/modules/parkingLot'
import Fax from '../components/modules/fax'
import FaxItem from '../components/modules/fax/faxItem'
import FaxSetting from '../components/modules/fax/faxSetting'

// PBX Settings
import PBXGeneralSettings from '../components/modules/pbxGeneralSettings'
import SIPSettings from '../components/modules/sipSettings'
import IAXSettings from '../components/modules/iaxSettings'
import RTPSettings from '../components/modules/rtpSettings'
import MusicOnHold from '../components/modules/musicOnHold'
import VoicePrompt from '../components/modules/voicePrompt'
import JitterBuffer from '../components/modules/jitterBuffer'
import InterfaceSettings from '../components/modules/interfaceSettings/'
import DigitalHardwareItem from '../components/modules/interfaceSettings/digitalHardwareItem'
import AnalogHardwareItem from '../components/modules/interfaceSettings/analogHardwareItem'
import RecordingStorageSettings from '../components/modules/recordingStorageSettings/index'
import RecordTypeStorage from '../components/modules/recordingStorageSettings/recordTypeStorage'

// System Settings
import HTTPServer from '../components/modules/httpServer/index'
import NetworkSettings from '../components/modules/networkSettings'
import DHCPClient from '../components/modules/networkSettings/dhcpclient'
import DHCPClientItem from '../components/modules/networkSettings/dhcpclientItem'
import StaticRoute from '../components/modules/networkSettings/staticRoute'
import StaticRouteItem from '../components/modules/networkSettings/staticRouteItem'
import StaticRouteIpv6Item from '../components/modules/networkSettings/staticRouteIpv6Item'
import PortForwarding from '../components/modules/networkSettings/portForwarding'
import PortForwardingItem from '../components/modules/networkSettings/portForwardingItem'
import OpenVPN from '../components/modules/openVPN'
import DDNSSettings from '../components/modules/ddnsSettings'
import SecuritySettings from '../components/modules/securitySettings'
import Security from '../components/modules/securitySettings/security'
import SecurityItem from '../components/modules/securitySettings/rules'
import LDAPServer from '../components/modules/ldapServer'
import LdapClientConf from '../components/modules/ldapServer/ldapClientConf'
import EditLdapPhonebook from '../components/modules/ldapServer/editLdapPhonebook'
import TimeSettings from '../components/modules/timeSettings'
import OfficeTime from '../components/modules/timeSettings/officetime'
import OfficeTimeItem from '../components/modules/timeSettings/officetimeItem'
import HolidayTime from '../components/modules/timeSettings/holidaytime'
import HolidayTimeItem from '../components/modules/timeSettings/holidaytimeItem'
import EmailSettings from '../components/modules/emailSettings'
import EmailTemplate from '../components/modules/emailSettings/emailTemplate'
import HA from '../components/modules/haSettings'

// Maintenance
import UserManagement from '../components/modules/userManagement'
import UserManage from '../components/modules/userManagement/userManagement'
import UserManagementItem from '../components/modules/userManagement/userManagementItem'
import CustomPrivilege from '../components/modules/userManagement/customPrivilege'
import CustomPrivilegeItem from '../components/modules/userManagement/customPrivilegeItem'
import ChangePassword from '../components/modules/changePassword'
import OperationLog from '../components/modules/operationLog'
import SystemLog from '../components/modules/systemLog'
import SystemEvent from '../components/modules/systemEvent'
import Warning from '../components/modules/systemEvent/warning'
import WarningEventsList from '../components/modules/systemEvent/warningEventsList'
import WarningEventsListItem from '../components/modules/systemEvent/warningEventsListItem'
import WarningContact from '../components/modules/systemEvent/warningContact'
import Upgrade from '../components/modules/upgrade'
import Backup from '../components/modules/backup'
import BackupCreate from '../components/modules/backup/backupCreate'
import BackupRegular from '../components/modules/backup/backupRegular'
import CleanReset from '../components/modules/cleanReset'
import NetTroubleshooting from '../components/modules/netTroubleshooting'
import SignalTroubleshooting from '../components/modules/signalTroubleshooting'
import ServiceCheck from '../components/modules/serviceCheck'

// CDR
import CDR from '../components/modules/cdr'
import AutoDownload from '../components/modules/cdr/autoDownload'
import Statistics from '../components/modules/statistics'
import RecordingFile from '../components/modules/recordingFile'
import CdrApi from '../components/modules/cdrApi'

// Value-added Features
import ZeroConfig from '../components/modules/zeroConfig'
import Devices from '../components/modules/zeroConfig/devices'
import DevicesItem from '../components/modules/zeroConfig/devicesItem'
import DevicesItemCustomSettings from '../components/modules/zeroConfig/deviceItemCustomSettings'
import EditSlectedDevices from '../components/modules/zeroConfig/editSlectedDevices'
import GlobalTemplates from '../components/modules/zeroConfig/globalTemplates'
import GlobalTemplateItem from '../components/modules/zeroConfig/globalTemplateItem'
import ModelTemplates from '../components/modules/zeroConfig/modelTemplates'
import ModelTemplateItem from '../components/modules/zeroConfig/modelTemplateItem'
import AMI from '../components/modules/ami'
import AMIItem from '../components/modules/ami/amiItem'
import AMISetting from '../components/modules/ami/amiSetting'
import CTIServer from '../components/modules/ctiServer'
import CRM from '../components/modules/crm'
import PMS from '../components/modules/pms'
import PMSWakeup from '../components/modules/pms/pmsWakeup'
import PMSRooms from '../components/modules/pms/pmsRooms'
import PMSMinibar from '../components/modules/pms/pmsMinibar'
import PMSWakeupItem from '../components/modules/pms/pmsWakeupItem'
import PMSRoomsItemAdd from '../components/modules/pms/pmsRoomsItemAdd'
import PMSRoomsItemBatchAdd from '../components/modules/pms/pmsRoomsItemBatchAdd'
import PMSMinibarItemBar from '../components/modules/pms/pmsMinibarItemBar'
import PMSMinibarItemWaiter from '../components/modules/pms/pmsMinibarItemWaiter'
import PMSMinibarItemGoods from '../components/modules/pms/pmsMinibarItemGoods'
import WakeupService from '../components/modules/wakeupService'
import WakeupServiceItem from '../components/modules/wakeupService/wakeupServiceItem'
import FAXSending from '../components/modules/faxSending'
import AnnouncementCenter from '../components/modules/announcementCenter'
import AnnouncementCenterItem from '../components/modules/announcementCenter/announcementCenterItem'
import AnnouncementGroupItem from '../components/modules/announcementCenter/announcementGroupItem'
import WebRTC from '../components/modules/webrtc'
import cookie from 'react-cookie'
import SubscribeEvent from '../components/api/subscribeEvent'

// user-basic-information
import UserInformation from '../components/modules/userInformation'
import UserExtension from '../components/modules/userExtension'
import UserConfig from '../components/modules/userConfig'

// user-personal-data
import UserFollowMe from '../components/modules/userFollowMe'
import UserVoicemail from '../components/modules/userVoicemail'
import UserVoicemailPromptItem from '../components/modules/userVoicemail/voicemailPromptItem'
import UserRecordingFile from '../components/modules/userRecordingFile'
import UserFaxFiles from '../components/modules/userFaxFiles'
import UserOnlineStatus from '../components/modules/userOnlineStatus'

// user-value-added-features
import UserWebrtc from '../components/modules/userWebrtc'
import UserWebrtcItem from '../components/modules/userWebrtc/userWebrtcItem'
import UserAgent from '../components/modules/userAgent'
import UserWakeupService from '../components/modules/userWakeupService'
import UserWakeupServiceItem from '../components/modules/userWakeupService/wakeupServiceItem'
import UserCrmUserSettings from '../components/modules/userCrmUserSettings'
import UCMGUI from "../components/api/ucmgui"

const routes = (state, currentLocaleData) => {
    function subscribeEvent(data) {
        if (data && data.location && data.location.pathname) {
            let arr = data.location.pathname.split("/")
            let path = arr[arr.length - 1]

            if (path && SubscribeEvent[path] && SubscribeEvent[path].subscribe) {
                SubscribeEvent[path].subscribe.map(function(item) {
                    window.socket.send(item)
                    console.log(JSON.stringify(item))
                })
            }

            window.LEAVEPAGE = path
        }
    }

    function unSubscribeEvent(data, LEAVEPAGE) {
        if (data && data.location && data.location.pathname) {
            if (LEAVEPAGE && SubscribeEvent[LEAVEPAGE] && SubscribeEvent[LEAVEPAGE].unsubscribe) {
                SubscribeEvent[LEAVEPAGE].unsubscribe.map(function(item) {
                    window.socket.send(item)
                    console.log(JSON.stringify(item))
                })
            }

            subscribeEvent(data)
        }
    }

    // Validate logon
    function requireAuth(data) {
        let role = localStorage.getItem('user_id')
        let menuPrivilege = JSON.parse(localStorage.getItem('html_privilege'))

        let pathname = data.location.pathname.split("/")
        let submenu = pathname[2] ? pathname[2] : pathname[1]

        if (!role || menuPrivilege[submenu] !== 1) {
            UCMGUI.logoutFunction.doLogout(undefined, currentLocaleData)

            return false
        }

        localStorage.setItem('topmenu', pathname[1])
        localStorage.setItem('submenu', pathname[2])

        if (window.socket) {
            if (!window.ISREFRESHPAGE) {
                let loginSubscribe = SubscribeEvent.login

                loginSubscribe.message.username = cookie.load("username")
                loginSubscribe.message.cookie = cookie.load("session-identify")

                window.ISREFRESHPAGE = true
                window.socket.send(loginSubscribe)

                setTimeout(() => {
                    unSubscribeEvent(data, window.LEAVEPAGE)
                }, 500)
            } else {
                unSubscribeEvent(data, window.LEAVEPAGE)
            }
        }

        // window.gsec = new UCMGUI.GSession()
        UCMGUI.loginFunction.checkTrigger()
        // return state.isLogin
    }

    return (
        <div>
            <Route path="/" component={ Login }>
                {/* login */}
                <Route path="login" component={ Login } />
            </Route>

            <Route path="/" component={ App }>
                { /* Setup Wizard */ }
                <Route path="setup-wizard" onEnter={ requireAuth } component={ SetupWizard } breadcrumbName={ currentLocaleData["LANG4283"] } />

                {/* System Status */}
                <Route path="system-status" breadcrumbName={ currentLocaleData["LANG585"] }>
                    <IndexRoute component={ Dashboard } />
                    <Route path="dashboard" onEnter={ requireAuth } component={ Dashboard } breadcrumbName={ currentLocaleData["LANG5261"] } />
                    <Route path="systemInformation" onEnter={ requireAuth } component={ SystemInformation } breadcrumbName={ currentLocaleData["LANG586"] } />
                    <Route path="activityCall" onEnter={ requireAuth } component={ ActivityCall } breadcrumbName={ currentLocaleData["LANG3006"] } />
                    <Route path="networkStatus" onEnter={ requireAuth } component={ NetworkStatus } breadcrumbName={ currentLocaleData["LANG4010"] } />
                </Route>

                {/* Extension / Trunk */}
                <Route path="extension-trunk" breadcrumbName={ currentLocaleData["LANG5263"] }>
                    <IndexRoute component={ Extension } />
                    <Route path="extension" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG87"] }>
                        <IndexRoute component={ Extension } />
                        <Route path="extension" onEnter={ requireAuth } component={ Extension } breadcrumbName={ currentLocaleData["LANG87"] } />
                        <Route path="add" onEnter={ requireAuth } component={ ExtensionItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="import" onEnter={ requireAuth } component={ ImportExtension } breadcrumbName={ currentLocaleData["LANG2734"] } />
                        <Route path="edit/:type/:id" onEnter={ requireAuth } component={ ExtensionItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="editSelected/:type/:id" onEnter={ requireAuth } component={ EditSelectedExtensions } breadcrumbName={ currentLocaleData["LANG734"] } />
                    </Route>
                    <Route path="extensionGroup" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG2800"] }>
                        <IndexRoute component={ ExtensionGroup } />
                        <Route path="add" onEnter={ requireAuth } component={ ExtensionGroupItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="edit/:id/:name" onEnter={ requireAuth } component={ ExtensionGroupItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="analogTrunk" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG639"] } >
                        <IndexRoute component={ AnalogTrunk } />
                        <Route path="analogTrunk" onEnter={ requireAuth } component={ AnalogTrunk } breadcrumbName={ currentLocaleData["LANG639"] } />
                        <Route path="add" onEnter={ requireAuth } component={ AnalogTrunkItem } breadcrumbName={ currentLocaleData["LANG762"] } />
                        <Route path="edit/:trunkId/:trunkName" onEnter={ requireAuth } component={ AnalogTrunkItem } breadcrumbName={ currentLocaleData["LANG762"] } />
                    </Route>
                    <Route path="digitalTrunk" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG3141"] } >
                        <IndexRoute component={ DigitalTrunk } />
                        <Route path="add" onEnter={ requireAuth } component={ DigitalTrunkItem } breadcrumbName={ currentLocaleData["LANG762"] } />
                        <Route path="edit/:trunkId/:trunkName" onEnter={ requireAuth } component={ DigitalTrunkItem } breadcrumbName={ currentLocaleData["LANG762"] } />
                        <Route path="dodTrunksList/:trunkId" onEnter={ requireAuth } component={ DigitalDodTrunksList } breadcrumbName={ currentLocaleData["LANG769"] } />
                    </Route>
                    <Route path="dataTrunk" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG3573"] } >
                        <IndexRoute component={ DataTrunk } />
                        <Route path="editDataTrunk" onEnter={ requireAuth } component={ EditDataTrunk } breadcrumbName={ currentLocaleData["LANG3573"] } />
                    </Route>
                    <Route path="voipTrunk" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG13"] }>
                        <IndexRoute component={ VoIPTrunk } />
                        <Route path="createVoipTrunk/:mode" onEnter={ requireAuth } component={ CreateVoipTrunk } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="editVoipTrunk/:trunkId/:technology/:trunkType/:trunkName" onEnter={ requireAuth } component={ EditVoipTrunk } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="dodTrunksList/:trunkId" onEnter={ requireAuth } component={ DodTrunksList } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="createEditDodTrunk/:type" onEnter={ requireAuth } component={ CreateEditDodTrunk } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="createEditDodTrunk/:type/:trunkId" onEnter={ requireAuth } component={ CreateEditDodTrunk } breadcrumbName={ currentLocaleData["LANG769"] } />
                    </Route>
                    <Route path="slaStation" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG3225"] }>
                        <IndexRoute component={ SLAStation } />
                        <Route path="add" onEnter={ requireAuth } component={ SLAStationItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="edit/:id/:name" onEnter={ requireAuth } component={ SLAStationItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="outboundRoute" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG14"] }>
                        <IndexRoute component={ OutboundRoute } />
                        <Route path="add" onEnter={ requireAuth } component={ OutboundRouteItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="blacklist" onEnter={ requireAuth } component={ OutboundBlackList } breadcrumbName={ currentLocaleData["LANG5336"] } />
                        <Route path="edit/:id/:name" onEnter={ requireAuth } component={ OutboundRouteItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="pingroups" onEnter={ requireAuth } component={ OutboundPinGroups } breadcrumbName={ currentLocaleData["LANG4553"] } />
                        <Route path="pingroups/add" onEnter={ requireAuth } component={ OutboundPinGroupsItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="pingroups/edit/:id/:name" onEnter={ requireAuth } component={ OutboundPinGroupsItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="inboundRoute" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG15"] }>
                        <IndexRoute component={ InboundRoute } />
                        <Route path=":trunkId" onEnter={ requireAuth } component={ InboundRoute } breadcrumbName={ currentLocaleData["LANG15"] } />
                        <Route path="add/:trunkId" onEnter={ requireAuth } component={ InboundRouteItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="settings/:trunkId" onEnter={ requireAuth } component={ InboundSettings } breadcrumbName={ currentLocaleData["LANG4543"] } />
                        <Route path="blacklist/:trunkId" onEnter={ requireAuth } component={ InboundBlackList } breadcrumbName={ currentLocaleData["LANG2278"] } />
                        <Route path="edit/:trunkId/:routeId" onEnter={ requireAuth } component={ InboundRouteItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                </Route>

                {/* Call Features */}
                <Route path="call-features" onEnter={ requireAuth} breadcrumbName={ currentLocaleData["LANG17"] }>
                    <IndexRoute component={ Conference } />
                    <Route path="conference" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG18"] }>
                        <IndexRoute component={ Conference } />
                        <Route path="add" onEnter={ requireAuth } component={ ConferenceItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="edit/:id" onEnter={ requireAuth } component={ ConferenceItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="conferenceSettings" onEnter={ requireAuth } component={ ConferenceSettings } breadcrumbName={ currentLocaleData["LANG5097"] } />
                        <Route path="scheduleIndex" onEnter={ requireAuth } component={ ScheduleIndex } breadcrumbName={ currentLocaleData["LANG3776"] } />
                        <Route path="editSchedule/:id" onEnter={ requireAuth } component={ ScheduleIndex } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="cleanSettings" onEnter={ requireAuth } component={ CleanSettings } breadcrumbName={ currentLocaleData["LANG4277"] } />
                        <Route path="calendarSettings" onEnter={ requireAuth } component={ CalendarSettings } breadcrumbName={ currentLocaleData["LANG3516"] } />
                        <Route path="authSettings" onEnter={ requireAuth } component={ AuthSettings } breadcrumbName={ currentLocaleData["LANG4390"] } />
                        <Route path=":jumpId" onEnter={ requireAuth } component={ Conference } breadcrumbName={ currentLocaleData["LANG18"] } />
                    </Route>
                    <Route path="ivr" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG19"] } >
                        <IndexRoute component={ IVR } />
                        <Route path="add" onEnter={ requireAuth } component={ IVRItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="edit/:id/:name" onEnter={ requireAuth } component={ IVRItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="voicemail" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG20"] }>
                        <IndexRoute component={ Voicemail } />
                        <Route path=":id" onEnter={ requireAuth } component={ Voicemail } breadcrumbName={ currentLocaleData["LANG20"] } />
                         <Route path="voicemailEmailSettings/email" onEnter={ requireAuth } component={ VoicemailEmailSettings } breadcrumbName={ currentLocaleData["LANG767"] } />
                        <Route path="voicemailgroup/add" onEnter={ requireAuth } component={ VoicemailGroupItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="voicemailgroup/edit/:id/:name" onEnter={ requireAuth } component={ VoicemailGroupItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                     </Route>
                    <Route path="ringGroup" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG22"] } >
                        <IndexRoute component={ RingGroup } />
                        <Route path="add" onEnter={ requireAuth } component={ RingGroupItem } breadcrumbName={ currentLocaleData["LANG600"] } />
                        <Route path="edit/:id/:name" onEnter={ requireAuth } component={ RingGroupItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="pagingIntercom" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG23"] } >
                        <IndexRoute component={ PagingIntercom } />
                        <Route path="add" onEnter={ requireAuth } component={ PagingIntercomItem } breadcrumbName={ currentLocaleData["LANG2884"] } />
                        <Route path="edit/:id/:name" onEnter={ requireAuth } component={ PagingIntercomItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="setting" onEnter={ requireAuth } component={ PagingIntercomSetting } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="callQueue" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG24"] }>
                        <IndexRoute component={ CallQueue } />
                        <Route path="add" onEnter={ requireAuth } component={ CallQueueItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="edit/:id" onEnter={ requireAuth } component={ CallQueueItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="settings" onEnter={ requireAuth } component={ AgentLoginSettings } breadcrumbName={ currentLocaleData["LANG748"] } />
                        <Route path="statistics" onEnter={ requireAuth } component={ CallQueueStatistics } breadcrumbName={ currentLocaleData["LANG8"] } />
                        <Route path="switchboard" onEnter={ requireAuth } component={ CallQueueSwitchboard } breadcrumbName={ currentLocaleData["LANG5407"] } />
                    </Route>
                    <Route path="pickupGroup" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG2510"] } >
                        <IndexRoute component={ PickupGroup } />
                        <Route path="add" onEnter={ requireAuth } component={ PickupGroupItem } breadcrumbName={ currentLocaleData["LANG2884"] } />
                        <Route path="edit/:id/:name" onEnter={ requireAuth } component={ PickupGroupItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="dialByName" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG3501"] }>
                        <IndexRoute component={ DialByName } />
                        <Route path="add" onEnter={ requireAuth } component={ DialByNameItem } breadcrumbName={ currentLocaleData["LANG2884"] } />
                        <Route path="edit/:id/:name" onEnter={ requireAuth } component={ DialByNameItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="speedDial" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG3501"] }>
                        <IndexRoute component={ SpeedDial } />
                        <Route path="add" onEnter={ requireAuth } component={ SpeedDialItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="edit/:id" onEnter={ requireAuth } component={ SpeedDialItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="disa" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG2353"] }>
                        <IndexRoute component={ DISA } />
                        <Route path="add" onEnter={ requireAuth } component={ DISAItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="edit/:id/:name" onEnter={ requireAuth } component={ DISAItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="callback" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG3741"] } >
                        <IndexRoute component={ CallBack } />
                        <Route path="add" onEnter={ requireAuth } component={ CallBackItem } breadcrumbName={ currentLocaleData["LANG3741"] } />
                        <Route path="edit/:id/:name" onEnter={ requireAuth } component={ CallBackItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="eventList" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG2474"] } >
                        <IndexRoute component={ EventList } />
                        <Route path="add" onEnter={ requireAuth } component={ EventListItem } breadcrumbName={ currentLocaleData["LANG2474"] } />
                        <Route path="edit" onEnter={ requireAuth } component={ EventListItem } breadcrumbName={ currentLocaleData["LANG2474"] } />
                    </Route>
                    <Route path="featureCode" onEnter={ requireAuth } component={ FeatureCode } breadcrumbName={ currentLocaleData["LANG26"] } />
                    <Route path="fax" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG29"] } >
                        <IndexRoute component={ Fax } />
                        <Route path="add" onEnter={ requireAuth } component={ FaxItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="edit/:id/:name" onEnter={ requireAuth } component={ FaxItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="setting" onEnter={ requireAuth } component={ FaxSetting } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="parkingLot" onEnter={ requireAuth } component={ ParkingLot } breadcrumbName={ currentLocaleData["LANG99"] } />
                </Route>

                {/* PBX Settings */}
                <Route path="pbx-settings" onEnter={ requireAuth} breadcrumbName={ currentLocaleData["LANG5299"] }>
                    <IndexRoute component={ PBXGeneralSettings } />
                    <Route path="pbxGeneralSettings" onEnter={ requireAuth } component={ PBXGeneralSettings } breadcrumbName={ currentLocaleData["LANG3949"] } />
                    <Route path="sipSettings" onEnter={ requireAuth } component={ SIPSettings } breadcrumbName={ currentLocaleData["LANG39"] } />
                    <Route path="iaxSettings" onEnter={ requireAuth } component={ IAXSettings } breadcrumbName={ currentLocaleData["LANG34"] } />
                    <Route path="rtpSettings" onEnter={ requireAuth } component={ RTPSettings } breadcrumbName={ currentLocaleData["LANG30"] } />
                    <Route path="musicOnHold" onEnter={ requireAuth } component={ MusicOnHold } breadcrumbName={ currentLocaleData["LANG27"] } />
                    <Route path="voicePrompt" onEnter={ requireAuth } component={ VoicePrompt } breadcrumbName={ currentLocaleData["LANG4752"] }>
                        <IndexRoute component={ VoicePrompt } />
                        <Route path=":id" onEnter={ requireAuth } component={ VoicePrompt } breadcrumbName={ currentLocaleData["LANG4752"] } />
                    </Route>
                    <Route path="jitterBuffer" onEnter={ requireAuth } component={ JitterBuffer } breadcrumbName={ currentLocaleData["LANG40"] } />
                    <Route path="interfaceSettings" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG5303"] }>
                        <IndexRoute component={ InterfaceSettings } />
                        <Route path=":id" onEnter={ requireAuth } component={ InterfaceSettings } breadcrumbName={ currentLocaleData["LANG4752"] } />
                        <Route path="digitalHardwareItem/:type/:span" onEnter={ requireAuth } component={ DigitalHardwareItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="analogHardwareItem/:type" onEnter={ requireAuth } component={ AnalogHardwareItem } breadcrumbName={ currentLocaleData["LANG687"] } />
                    </Route>
                    <Route path="recordingStorageSettings" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG5304"] }>
                        <IndexRoute component={ RecordingStorageSettings } />
                        <Route path=":id" onEnter={ requireAuth } component={ RecordTypeStorage } breadcrumbName={ currentLocaleData["LANG3756"] } />
                    </Route>
                </Route>

                {/* System Settings */}
                <Route path="system-settings" onEnter={ requireAuth} breadcrumbName={ currentLocaleData["LANG5300"] }>
                    <IndexRoute component={ HTTPServer } />
                    <Route path="httpServer" onEnter={ requireAuth } component={ HTTPServer } breadcrumbName={ currentLocaleData["LANG57"] } />
                    <Route path="networkSettings" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG48"] } >
                        <IndexRoute component={ NetworkSettings } />
                        <Route path=":id" onEnter={ requireAuth } component={ NetworkSettings } breadcrumbName={ currentLocaleData["LANG4855"] } />
                        <Route path="dhcpClient/add" onEnter={ requireAuth } component={ DHCPClientItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="dhcpClient/edit/:id/:name/:isbind" onEnter={ requireAuth } component={ DHCPClientItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="staticRoute/add" onEnter={ requireAuth } component={ StaticRouteItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="staticRoute/edit/:id/:name" onEnter={ requireAuth } component={ StaticRouteItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="staticRoute/addIpv6" onEnter={ requireAuth } component={ StaticRouteIpv6Item } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="staticRoute/editIpv6/:id/:name" onEnter={ requireAuth } component={ StaticRouteIpv6Item } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="portForwarding/add" onEnter={ requireAuth } component={ PortForwardingItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="portForwarding/edit/:id/:name" onEnter={ requireAuth } component={ PortForwardingItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="openVPN" onEnter={ requireAuth } component={ OpenVPN } breadcrumbName={ currentLocaleData["LANG3990"] } />
                    <Route path="ddnsSettings" onEnter={ requireAuth } component={ DDNSSettings } breadcrumbName={ currentLocaleData["LANG4040"] } />
                    <Route path="securitySettings" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG718"] }>
                        <IndexRoute component={ SecuritySettings } />
                        <Route path=":id" onEnter={ requireAuth } component={ SecuritySettings } breadcrumbName={ currentLocaleData["LANG4855"] } />
                        <Route path="security/add" onEnter={ requireAuth } component={ SecurityItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="security/edit/:id/:name" onEnter={ requireAuth } component={ SecurityItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                     </Route>
                    <Route path="ldapServer" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG56"] } >
                        <IndexRoute component={ LDAPServer } />
                        <Route path=":tab" component={ LDAPServer } />
                        <Route path="ldapPhonebook/ldapClientConf" onEnter={ requireAuth } component={ LdapClientConf } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="ldapPhonebook/edit" onEnter={ requireAuth } component={ EditLdapPhonebook } breadcrumbName={ currentLocaleData["LANG769"] } />
                    </Route>
                    <Route path="timeSettings" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG718"] }>
                        <IndexRoute component={ TimeSettings } />
                        <Route path=":id" onEnter={ requireAuth } component={ TimeSettings } breadcrumbName={ currentLocaleData["LANG4855"] } />
                        <Route path="officetime/add" onEnter={ requireAuth } component={ OfficeTimeItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="officetime/edit/:id/:name" onEnter={ requireAuth } component={ OfficeTimeItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="holidaytime/add" onEnter={ requireAuth } component={ HolidayTimeItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="holidaytime/edit/:id/:name" onEnter={ requireAuth } component={ HolidayTimeItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="emailSettings" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG58"] }>
                        <IndexRoute component={ EmailSettings } />
                        <Route path=":tab" onEnter={ requireAuth } component={ EmailSettings } breadcrumbName={ currentLocaleData["LANG58"] } />
                        <Route path="template/:type" onEnter={ requireAuth } component={ EmailTemplate } breadcrumbName={ currentLocaleData["LANG4572"] } />
                    </Route>
                    <Route path="haSettings" onEnter={ requireAuth } component={ HA } breadcrumbName={ currentLocaleData["LANG4359"] } />
                </Route>

                {/* Maintenance */}
                <Route path="maintenance" onEnter={ requireAuth} breadcrumbName={ currentLocaleData["LANG60"] }>
                    <IndexRoute component={ UserManagement } />
                    <Route path="userManagement" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG3859"] } >
                        <IndexRoute component={ UserManagement } />
                        <Route path=":tab" onEnter={ requireAuth } component={ UserManagement } breadcrumbName={ currentLocaleData["LANG3859"] } />
                        <Route path="user/add" onEnter={ requireAuth } component={ UserManagementItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="user/edit/:id/:name" onEnter={ requireAuth } component={ UserManagementItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="privilege/add" onEnter={ requireAuth } component={ CustomPrivilegeItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="privilege/edit/:id/:name" onEnter={ requireAuth } component={ CustomPrivilegeItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="changePassword" onEnter={ requireAuth } component={ ChangePassword } breadcrumbName={ currentLocaleData["LANG55"] } />
                    <Route path="operationLog" onEnter={ requireAuth } component={ OperationLog } breadcrumbName={ currentLocaleData["LANG3908"] } />
                    <Route path="systemLog" onEnter={ requireAuth } component={ SystemLog } breadcrumbName={ currentLocaleData["LANG67"] } />
                    <Route path="systemEvent" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG4855"] } >
                        <IndexRoute component={ SystemEvent } />
                        <Route path=":id" onEnter={ requireAuth } component={ SystemEvent } breadcrumbName={ currentLocaleData["LANG2580"] } />
                        <Route path="warningEventsList/edit/:id" onEnter={ requireAuth } component={ WarningEventsListItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="warningContact" onEnter={ requireAuth } component={ WarningContact } breadcrumbName={ currentLocaleData["LANG61"] } />
                    <Route path="upgrade" onEnter={ requireAuth } component={ Upgrade } breadcrumbName={ currentLocaleData["LANG61"] } />
                    <Route path="backup" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG62"] } >
                        <IndexRoute component={ Backup } />
                        <Route path="create" onEnter={ requireAuth } component={ BackupCreate } breadcrumbName={ currentLocaleData["LANG758"] } />
                        <Route path="regular" onEnter={ requireAuth } component={ BackupRegular } breadcrumbName={ currentLocaleData["LANG4048"] } />
                    </Route>
                    <Route path="cleanReset" onEnter={ requireAuth } component={ CleanReset } breadcrumbName={ currentLocaleData["LANG5302"] } />
                    <Route path="netTroubleshooting" onEnter={ requireAuth } component={ NetTroubleshooting } breadcrumbName={ currentLocaleData["LANG5461"] } />
                    <Route path="signalTroubleshooting" onEnter={ requireAuth } component={ SignalTroubleshooting } breadcrumbName={ currentLocaleData["LANG5462"] } />
                    <Route path="serviceCheck" onEnter={ requireAuth } component={ ServiceCheck } breadcrumbName={ currentLocaleData["LANG3437"] } />
                </Route>

                {/* CDR */}
                <Route path="cdr" onEnter={ requireAuth} breadcrumbName={ currentLocaleData["LANG7"] }>
                    <IndexRoute component={ CDR } />
                    <Route path="cdr" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG7"] }>
                        <IndexRoute component={ CDR } />
                        <Route path="autoDownload" onEnter={ requireAuth } component={ AutoDownload } breadcrumbName={ currentLocaleData["LANG3955"] } />
                    </Route>
                    <Route path="statistics" onEnter={ requireAuth } component={ Statistics } breadcrumbName={ currentLocaleData["LANG8"] } />
                    <Route path="recordingFile" onEnter={ requireAuth } component={ RecordingFile } breadcrumbName={ currentLocaleData["LANG2640"] } />
                    <Route path="cdrApi" onEnter={ requireAuth } component={ CdrApi } breadcrumbName={ currentLocaleData["LANG3003"] } />
                </Route>

                {/* Value-added Features */}
                <Route path="value-added-features" onEnter={ requireAuth} breadcrumbName={ currentLocaleData["LANG4066"] }>
                    <IndexRoute component={ ZeroConfig } />
                    <Route path="zeroConfig" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG16"] } >
                        <IndexRoute component={ ZeroConfig } />
                        <Route path=":tab" component={ ZeroConfig } />
                        <Route path="devices/res" onEnter={ requireAuth } component={ ZeroConfig } breadcrumbName={ currentLocaleData["LANG16"] } />
                        <Route path="devices/add" onEnter={ requireAuth } component={ DevicesItem } breadcrumbName={ currentLocaleData["LANG16"] } />
                        <Route path="devices/edit" onEnter={ requireAuth } component={ DevicesItem } breadcrumbName={ currentLocaleData["LANG16"] } />
                        <Route path="devices/customSettings" onEnter={ requireAuth } component={ DevicesItemCustomSettings } breadcrumbName={ currentLocaleData["LANG16"] } />
                        <Route path="devices/editSlected" onEnter={ requireAuth } component={ EditSlectedDevices } breadcrumbName={ currentLocaleData["LANG16"] } />
                        <Route path="globalTemplates/add" onEnter={ requireAuth } component={ GlobalTemplateItem } breadcrumbName={ currentLocaleData["LANG3446"] } />
                        <Route path="globalTemplates/edit/:id/:name" onEnter={ requireAuth } component={ GlobalTemplateItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="modelTemplates/add" onEnter={ requireAuth } component={ ModelTemplateItem } breadcrumbName={ currentLocaleData["LANG3446"] } />
                        <Route path="modelTemplates/edit/:id/:name" onEnter={ requireAuth } component={ ModelTemplateItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="ami" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG3525"] } >
                        <IndexRoute component={ AMI } />
                        <Route path="add" onEnter={ requireAuth } component={ AMIItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="edit/:id/:name" onEnter={ requireAuth } component={ AMIItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="setting" onEnter={ requireAuth } component={ AMISetting } breadcrumbName={ currentLocaleData["LANG3827"] } />
                    </Route>
                    <Route path="ctiServer" onEnter={ requireAuth } component={ CTIServer } breadcrumbName={ currentLocaleData["LANG4815"] } />
                    <Route path="crm" onEnter={ requireAuth } component={ CRM } breadcrumbName={ currentLocaleData["LANG5110"] } />
                    <Route path="pms" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG4855"] } >
                        <IndexRoute component={ PMS } />
                        <Route path=":id" onEnter={ requireAuth } component={ PMS } breadcrumbName={ currentLocaleData["LANG4855"] } />
                        <Route path="pmsWakeup/add" onEnter={ requireAuth } component={ PMSWakeupItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="pmsWakeup/edit/:id/:name" onEnter={ requireAuth } component={ PMSWakeupItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="pmsRooms/add" onEnter={ requireAuth } component={ PMSRoomsItemAdd } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="pmsRooms/edit/:id/:name" onEnter={ requireAuth } component={ PMSRoomsItemAdd } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="pmsRooms/batchadd" onEnter={ requireAuth } component={ PMSRoomsItemBatchAdd } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="pmsMinibar/addbar" onEnter={ requireAuth } component={ PMSMinibarItemBar } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="pmsMinibar/editbar/:id/:name" onEnter={ requireAuth } component={ PMSMinibarItemBar } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="pmsMinibar/addwaiter" onEnter={ requireAuth } component={ PMSMinibarItemWaiter } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="pmsMinibar/editwaiter/:id/:name" onEnter={ requireAuth } component={ PMSMinibarItemWaiter } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="pmsMinibar/addgoods" onEnter={ requireAuth } component={ PMSMinibarItemGoods } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="pmsMinibar/editgoods/:id/:name" onEnter={ requireAuth } component={ PMSMinibarItemGoods } breadcrumbName={ currentLocaleData["LANG738"] } />
                     </Route>
                    <Route path="wakeupService" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG4858"] } >
                        <IndexRoute component={ WakeupService } />
                        <Route path="add" onEnter={ requireAuth } component={ WakeupServiceItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="edit/:id/:name" onEnter={ requireAuth } component={ WakeupServiceItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="faxSending" onEnter={ requireAuth } component={ FAXSending } breadcrumbName={ currentLocaleData["LANG4067"] } />
                    <Route path="announcementCenter" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG4338"] } >
                        <IndexRoute component={ AnnouncementCenter } />
                        <Route path="add" onEnter={ requireAuth } component={ AnnouncementCenterItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="edit/:id/:name" onEnter={ requireAuth } component={ AnnouncementCenterItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                        <Route path="addgroup" onEnter={ requireAuth } component={ AnnouncementGroupItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="editgroup/:id/:name" onEnter={ requireAuth } component={ AnnouncementGroupItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="webrtc" onEnter={ requireAuth } component={ WebRTC } breadcrumbName={ currentLocaleData["LANG4263"] } />
                </Route>
                {/* user-basic-information */}
                <Route path="user-basic-information" onEnter={ requireAuth} breadcrumbName={ currentLocaleData["LANG7"] }>
                    <IndexRoute component={ UserInformation } />
                    <Route path="userInformation" onEnter={ requireAuth } component={ UserInformation } breadcrumbName={ currentLocaleData["LANG7"] } />
                    <Route path="userConfig" onEnter={ requireAuth } component={ UserConfig } breadcrumbName={ currentLocaleData["LANG5614"] } />
                    <Route path="userExtension" onEnter={ requireAuth } component={ UserExtension } breadcrumbName={ currentLocaleData["LANG8"] } />
                    <Route path="cdr" onEnter={ requireAuth } component={ CDR } breadcrumbName={ currentLocaleData["LANG2640"] } />
                    <Route path="changePassword" onEnter={ requireAuth } component={ ChangePassword } breadcrumbName={ currentLocaleData["LANG3003"] } />
                </Route>
                {/* user-personal-data */}
                <Route path="user-personal-data" onEnter={ requireAuth} breadcrumbName={ currentLocaleData["LANG7"] }>
                    <IndexRoute component={ UserFollowMe } />
                    <Route path="userFollowMe" onEnter={ requireAuth } component={ UserFollowMe } breadcrumbName={ currentLocaleData["LANG7"] } />
                    <Route path="userVoicemail" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG20"] } >
                        <IndexRoute component={ UserVoicemail } />
                        <Route path="update" onEnter={ requireAuth } component={ UserVoicemailPromptItem } breadcrumbName={ currentLocaleData["LANG4722"] } />
                    </Route>
                    <Route path="userRecordingFile" onEnter={ requireAuth } component={ UserRecordingFile } breadcrumbName={ currentLocaleData["LANG2640"] } />
                    <Route path="userFaxFiles" onEnter={ requireAuth } component={ UserFaxFiles } breadcrumbName={ currentLocaleData["LANG3003"] } />
                    <Route path="userOnlineStatus" onEnter={ requireAuth } component={ UserOnlineStatus } breadcrumbName={ currentLocaleData["LANG3003"] } />
                </Route>
                {/* user-value-added-features */}
                <Route path="user-value-added-features" onEnter={ requireAuth} breadcrumbName={ currentLocaleData["LANG7"] }>
                    <IndexRoute component={ UserWebrtc } />
                    <Route path="userWebrtc" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG7"] } >
                        <IndexRoute component={ UserWebrtc } />
                        <Route path="settings" onEnter={ requireAuth } component={ UserWebrtcItem } breadcrumbName={ currentLocaleData["LANG7"] } />
                    </Route>
                    <Route path="faxSending" onEnter={ requireAuth } component={ FAXSending } breadcrumbName={ currentLocaleData["LANG8"] } />
                    <Route path="userAgent" onEnter={ requireAuth } component={ UserAgent } breadcrumbName={ currentLocaleData["LANG2640"] } />
                    <Route path="userWakeupService" onEnter={ requireAuth } breadcrumbName={ currentLocaleData["LANG3003"] } >
                        <IndexRoute component={ UserWakeupService } />
                        <Route path="add" onEnter={ requireAuth } component={ UserWakeupServiceItem } breadcrumbName={ currentLocaleData["LANG769"] } />
                        <Route path="edit/:id/:name" onEnter={ requireAuth } component={ UserWakeupServiceItem } breadcrumbName={ currentLocaleData["LANG738"] } />
                    </Route>
                    <Route path="userCrmUserSettings" onEnter={ requireAuth } component={ UserCrmUserSettings } breadcrumbName={ currentLocaleData["LANG2640"] } />
                </Route>
            </Route>
        </div>
    )
}

export default routes
