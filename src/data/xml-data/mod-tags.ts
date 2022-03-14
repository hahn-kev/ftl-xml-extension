import {boolAttr, XmlTag} from './helpers';
import {IAttributeData} from 'vscode-html-languageservice';

const findAttributes: IAttributeData[] = [
  {name: 'type', description: 'tag name to match against optional, if type="event" then `<event>` would match'},
  boolAttr('reverse', 'defaults to true'),
  {name: 'start'},
  {name: 'limit', description: 'limit the number of tags that are modified, defaults to 1'},
  boolAttr('panic', 'slipstream will error when patching if tag is not found with a matching name, defaults to false')
];

const findTags: XmlTag[] = [
  {
    name: 'mod:findName',
    attributes: [
      {
        name: 'name',
        description: 'element must have a name attribute matching this value, for example if `name="FINAL_BOSS"` then `<bla name="FINAL_BOSS">` would match'
      },
      ...findAttributes
    ]
  },
  {
    name: 'mod:findLike',
    attributes: [
      ...findAttributes
    ],
    tags: ['mod:selector'],
    description: 'used as a more broad search than findName, use with `<mod:selector>` to configure matching'
  },
  {
    name: 'mod:selector',
    attributes: [],
    description: 'used with mod:findLike or mod:findWithChildLike to specify tag attributes to match'
  },
  {
    name: 'mod:findWithChildLike',
    attributes: [...findAttributes, {
      name: 'child-type',
      description: 'similar to type, but used to match the child tags'
    }],
    tags: ['mod:selector'],
    description: 'used as a more broad search than findName, use with `<mod:selector>` to configure matching'
  },
  {
    name: 'mod:findComposite',
    attributes: [...findAttributes.filter((a) => a.name != 'type')],
    tags: ['mod:par'],
    description: 'used to combine multiple find tags, they should be contained in a `<mod:par>` tag'
  },
  {
    name: 'mod:par',
    attributes: [{
      name: 'op',
      values: [{name: 'AND'}, {name: 'OR'}],
      description: 'must be defined. adjust how the find commands are combined'
    }],
    description: 'used with mod:findComposite to match against multiple find tags'
  }
];

const modCommandTags: XmlTag[] = [
  {
    name: 'mod:setAttributes',
    attributes: [],
    description: 'changes or adds the attributes from this tag to the one that was found'
  },
  {
    name: 'mod:removeAttributes',
    attributes: [],
    description: 'removes the attributes from this tag to the one that was found'
  },
  {
    name: 'mod:setValue',
    attributes: [],
    description: 'sets the contents of the found tag overwriting the previous contents'
  },
  {
    name: 'mod:removeTag',
    attributes: [],
    description: 'removes the found tag from the file'
  },
  {
    name: 'mod-append:',
    attributes: [],
    description: 'syntax example `<mod-append:choice>` will add a choice tag as a child of the found tag, any attributes specified will be preserved',
  },
  {
    name: 'mod-overwrite:',
    attributes: [],
    description: 'syntax example `<mod-overwrite:choice>` will replace the first choice tag in the found tag with the one specified here, any attributes specified will be preserved',
  }
];

export const modTags: XmlTag[] = [
  ...findTags,
  ...modCommandTags
];
