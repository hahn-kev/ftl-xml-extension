/* eslint-disable max-len */
import {boolAttr, XmlTag} from './helpers';
import {IAttributeData} from 'vscode-html-languageservice';
import {TagsValueSet} from '../autocomplete-value-sets';

const findAttributes: IAttributeData[] = [
  {
    name: 'type',
    description: 'tag name to match against optional, if type="event" then `<event>` would match',
    valueSet: TagsValueSet.name
  },
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
    ],
    description: `Searches for tags of a given type with the given name attribute. The type arg is optional. Its unusual defaults are: reverse="true", start="0", limit="1". It finds the first match from the end.`
  },
  {
    name: 'mod:findLike',
    attributes: [
      ...findAttributes
    ],
    tags: ['mod:selector'],
    description: `Searches for tags of a given type, with all of the given attributes and the given value. All of these find arguments are optional. To omit the value, leave it blank, or make <mod:selector /> self-closing. If no value or attributes are given, <mod:selector> is unnecessary.`
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
    description: `similar to <mod:findLike>, except it searches for tags of a given type, that contain certain children with the attributes and value. All args are optional here as well. Note: The children are only search criteria, not results themselves.`
  },
  {
    name: 'mod:findComposite',
    attributes: [...findAttributes.filter((a) => a.name != 'type')],
    tags: ['mod:par'],
    description: `Collates results from several <mod:find...> criteria, or even multiple nested <mod:par>entheses. The <mod:par> combines results using "OR" (union) or "AND" (intersection) logic. Any commands within those <mod:find...> tags will be ignored.`
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
    description: 'changes or adds the attributes from this tag to the context tag'
  },
  {
    name: 'mod:removeAttributes',
    attributes: [],
    description: 'removes the attributes from this tag to the context tag'
  },
  {
    name: 'mod:setValue',
    attributes: [],
    description: 'sets the contents of the context tag overwriting the previous contents'
  },
  {
    name: 'mod:removeTag',
    attributes: [],
    description: 'removes the context tag from the file'
  },
  {
    name: 'mod-append:',
    attributes: [],
    description: '`mod-append:` syntax example `<mod-append:choice>` will add a choice tag as a child of the context tag, any attributes specified will be preserved',
  },
  {
    name: 'mod-overwrite:',
    attributes: [],
    description: '`mod-overwrite:` syntax example `<mod-overwrite:choice>` will replace the first choice tag in the context tag with the one specified here, any attributes specified will be preserved',
  }
];

export const modTags: XmlTag[] = [
  ...findTags,
  ...modCommandTags
];
