import cookie from 'react-cookie'

module.exports = {
    login: {
        "type": "request",
        "message": {
            "transactionid": "123456789zxa",
            // "action": "challenge",
            // "username": "username",
            // "version": "1"
            "action": "login",
            "username": "username",
            "cookie": "session-identify"
        }
    },
    logout: {
        "type": "request",
        "message": {
            "transactionid": "123456789zxb",
            "action": "logout"
        }
    },
    dashboard: {
        "subscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "subscribe",
                "eventnames": [
                    "TrunkStatus",
                    "InterfaceStatus",
                    "ResourceUsageStatus",
                    "EquipmentCapacityStatus"
                ]
            }
        }],
        "unsubscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "unsubscribe",
                "eventnames": [
                    "TrunkStatus",
                    "InterfaceStatus",
                    "ResourceUsageStatus",
                    "EquipmentCapacityStatus"
                ]
            }
        }]
    },
    extension: {
        "subscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "subscribe", 
                "eventnames": ["ExtensionStatus"]
            }
        }],
        "unsubscribe": []
    },
    cdr: {
        "subscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "subscribe",
                "eventnames": ["InterfaceStatus"]
            }
        }],
        "unsubscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "unsubscribe",
                "eventnames": ["InterfaceStatus"]
            }
        }]
    },
    recordingFile: {
        "subscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "subscribe",
                "eventnames": ["InterfaceStatus"]
            }
        }],
        "unsubscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "unsubscribe",
                "eventnames": ["InterfaceStatus"]
            }
        }]
    },
    switchboard: {
        "subscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "subscribe", 
                "eventnames": ["CallQueueStatus"]
            }
        }],
        "unsubscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "unsubscribe",
                "eventnames": ["CallQueueStatus"]
            }
        }]
    },
    conference: {
        "subscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "subscribe", 
                "eventnames": ["ConferenceStatus", "InterfaceStatus"]
            }
        }],
        "unsubscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "unsubscribe",
                "eventnames": ["ConferenceStatus", "InterfaceStatus"]
            }
        }]
    },
    activityCall: {
        "subscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "subscribe", 
                "eventnames": ["ActiveCallStatus"]
            }
        }],
        "unsubscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "unsubscribe",
                "eventnames": ["ActiveCallStatus"]
            }
        }]
    },
    userInformation: {
        "subscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "subscribe", 
                "eventnames": ["VoiceMailStatus", "ConfigReloadStatus"]
            }
        }],
        "unsubscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "unsubscribe",
                "eventnames": ["VoiceMailStatus", "ConfigReloadStatus"]
            }
        }]
    },
    userAgent: {
        "subscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "subscribe", 
                "eventnames": ["CallQueueStatus"]
            }
        }],
        "unsubscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "unsubscribe",
                "eventnames": ["CallQueueStatus"]
            }
        }]
    },
    zeroConfig: {
        "subscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "subscribe", 
                "eventnames": ["ZCFoundStatus"]
            }
        }],
        "unsubscribe": [{
            "type": "request",
            "message": {
                "transactionid": "123456789zxc",
                "action": "unsubscribe",
                "eventnames": ["ZCFoundStatus"]
            }
        }]
    }
}
