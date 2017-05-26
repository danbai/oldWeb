// =======================================================
// Constants
// =======================================================
export const CGI_DATA_TYPE = {
	CGI_DATA_BLOCK: "block",
    CGI_DATA_BLOCKELEMENT: "blockelement",
    CGI_DATA_ELEMENT: "element",
    CGI_DATA_GLOBAL_LIST: "globalList",
    CGI_DATA_GLOBAL_TYPE: "globalType",
    CGI_DATA_MODEL: "model",
    CGI_DATA_MODEL_ALIAS: "modelAlias",
    CGI_DATA_MODEL_LIST: "modelList",
    CGI_DATA_MODEL_TYPE: "modelType",
    CGI_DATA_MODEL_PROPERTY: "modelProperty",
    CGI_DATA_MODEL_GROUP: "modelGroup",
    CGI_DATA_MODEL_GROUPFIELD: "modelGroupfield",
    CGI_DATA_MODEL_FIELD: "modelField",
    CGI_DATA_MODEL_FIELD_MAPPING: "modelFieldMapping",
    CGI_DATA_MODEL_LANGUAGE: "modelLanguage",
    CGI_DATA_MODEL_LANGUAGE_EXTENSION: "modelLanguageExtension",
    CGI_DATA_MODEL_IMAGEMAPPING: "modelImageMapping",
    CGI_DATA_MODEL_IMAGEMAPPING_REGION: "modelImageMappingRegion",
    CGI_DATA_MODEL_IMAGEMAPPING_REGION_LINK: "modelImageMappingRegionLink",
    CGI_DATA_LIST_ITEM: "listItem",
    CGI_DATA_TYPE_ENTITY: "typeEntity"
}

export const CGI_STATE_TYPE = {
	CGI_STATE_DOWNLOADING: 1,
	CGI_STATE_DOWNLOADED: 2,
	CGI_STATE_PROCESSED: 3
}

export const CGI_DATA_CHUCK_SIZE = 10

export const VALUE_TYPE = {
	VALUE_TYPE_UNKNOWN: 0,
	VALUE_TYPE_SHARE_VARIABLE: 1,
	VALUE_TYPE_CONSTANT: 2,
	VALUE_TYPE_FUNC_CONCAT: 3,
	VALUE_TYPE_FUNC_ADD: 4
}

export const DATA_STATE_TYPE = {
	DATA_STATE_UNKNOWN: -1,
    DATA_STATE_COMPLETION: 0,
    DATA_STATE_STRING: 1,
    DATA_STATE_SHARED_VARIABLE: 2,
    DATA_STATE_SHARED_VARIABLE_2: 3,
    DATA_STATE_FUNCTION: 4,
    DATA_STATE_FUNCTION_2: 5,
    DATA_STATE_FUNCTION_3: 6,
    DATA_STATE_FUNCTION_4: 7,
    DATA_STATE_FUNCTION_5: 8,
    DATA_STATE_FUNCTION_6: 9,
    DATA_STATE_FUNCTION_7: 10,
    DATA_STATE_FUNCTION_8: 11,
    DATA_STATE_FUNCTION_9: 12,
    DATA_STATE_FUNCTION_10: 13,
    DATA_STATE_FUNCTION_11: 14

}

// =======================================================
// Expression parser
// =======================================================
export const EXPRESSION_TYPE = {
	EXPRESSION_TYPE_UNKNOWN: 0,
    EXPRESSION_TYPE_EXPRESSION: 1,
    EXPRESSION_TYPE_VALUE: 2
}

export const EXPRESSION_OP = {
    EXPRESSION_OP_UNKNOWN: 0,
    EXPRESSION_OP_EQ: 1, // equal to
    EXPRESSION_OP_NE: 2, // not equal to
    EXPRESSION_OP_GT: 3, // greater than
    EXPRESSION_OP_GE: 4, // greater than or equal to
    EXPRESSION_OP_LT: 5, // less than
    EXPRESSION_OP_LE: 6, // less than or equal to
    EXPRESSION_OP_AND: 7, // logical and
    EXPRESSION_OP_OR: 8, // logical or
    EXPRESSION_OP_IN: 9 // left value is included in right value
}

