// Generated code for namespace: org.accordproject.commonmark@0.5.0

// imports

// Warning: Beware of circular dependencies when modifying these imports

// Warning: Beware of circular dependencies when modifying these imports

// Warning: Beware of circular dependencies when modifying these imports
import type {
	IElement
} from './ciceromark';
import type {
	IElementDefinition
} from './templatemark';
import {IConcept} from './concerto-base';

// interfaces
export interface INode extends IConcept {
  text?: string;
  nodes?: INode[];
  startLine?: number;
  endLine?: number;
}

export type NodeUnion = IRoot | 
IChild;

export interface IRoot extends INode {
}

export type RootUnion = IDocument;

export interface IChild extends INode {
}

export type ChildUnion = IText | 
ICodeBlock | 
ICode | 
IHtmlInline | 
IHtmlBlock | 
IEmph | 
IStrong | 
IBlockQuote | 
IHeading | 
IThematicBreak | 
ISoftbreak | 
ILinebreak | 
ILink | 
IImage | 
IParagraph | 
IList | 
IItem | 
ITable | 
ITableHead | 
ITableBody | 
ITableRow | 
IHeaderCell | 
ITableCell | 
IElement | 
IElementDefinition;

export interface IText extends IChild {
}

export interface IAttribute extends IConcept {
  name: string;
  value: string;
}

export interface ITagInfo extends IConcept {
  tagName: string;
  attributeString: string;
  attributes: IAttribute[];
  content: string;
  closed: boolean;
}

export interface ICodeBlock extends IChild {
  info?: string;
  tag?: ITagInfo;
}

export interface ICode extends IChild {
  info?: string;
}

export interface IHtmlInline extends IChild {
  tag?: ITagInfo;
}

export interface IHtmlBlock extends IChild {
  tag?: ITagInfo;
}

export interface IEmph extends IChild {
}

export interface IStrong extends IChild {
}

export interface IBlockQuote extends IChild {
}

export interface IHeading extends IChild {
  level: string;
}

export interface IThematicBreak extends IChild {
}

export interface ISoftbreak extends IChild {
}

export interface ILinebreak extends IChild {
}

export interface ILink extends IChild {
  destination: string;
  title: string;
}

export interface IImage extends IChild {
  destination: string;
  title: string;
}

export interface IParagraph extends IChild {
}

export interface IList extends IChild {
  type: string;
  start?: string;
  tight: string;
  delimiter?: string;
}

export interface IItem extends IChild {
}

export interface IDocument extends IRoot {
  xmlns: string;
}

export interface ITable extends IChild {
}

export interface ITableHead extends IChild {
}

export interface ITableBody extends IChild {
}

export interface ITableRow extends IChild {
}

export interface IHeaderCell extends IChild {
}

export interface ITableCell extends IChild {
}

