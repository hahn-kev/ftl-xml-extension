import {
    HTMLDataV1,
    IAttributeData,
    IValueSet
} from 'vscode-html-languageservice';

// type XmlTag = ITagData & { tags?: string[] };
type XmlData = HTMLDataV1
// & { tags: XmlTag[] }
    ;

function boolAttr(name: string): IAttributeData {
    return {name: name, valueSet: 'bool'};
}

export const EventNamesValueSet: IValueSet = {
    name: 'event-names',
    values: [{name: 'test'}]
}

export const FtlData: XmlData = {
    version: 1.1,
    tags: [
        {
            name: 'event',
            attributes: [
                {name: 'name'},
                boolAttr('hidden'),
                boolAttr('unique'),
                {name: 'load', valueSet: EventNamesValueSet.name}
            ]
        },
        {
            name: 'choice',
            attributes: [
                boolAttr('unique'),
                boolAttr('hidden'),
                {name: "req"},
                {name: "lvl"},
                boolAttr('blue'),
                {name: "max_group"},
                {name: "max_lvl"},
                {name: "min_level"}
            ]
        },
        {
            name: 'loadEvent',
            attributes: []
        }
    ],
    valueSets: [
        {name: 'bool', values: [{name: 'true'}, {name: 'false'}]},
        EventNamesValueSet
    ]
}
