// Generated code for namespace: concerto@1.0.0

// imports

// Warning: Beware of circular dependencies when modifying these imports
import type {
	IPosition,
	IRange,
	ITypeIdentifier,
	IDecoratorLiteral,
	IDecorator,
	IIdentified,
	IDeclaration,
	IMapKeyType,
	IMapValueType,
	IEnumProperty,
	IProperty,
	IStringRegexValidator,
	IStringLengthValidator,
	IDoubleDomainValidator,
	IIntegerDomainValidator,
	ILongDomainValidator,
	IAliasedType,
	IImport,
	IModel,
	IModels
} from './concerto-metamodel';
import type {
	INode,
	IAttribute,
	ITagInfo
} from './commonmark';
import type {
	CodeType,
	ICode
} from './templatemark';

// interfaces
export interface IConcept {
  $class: string;
}

export type ConceptUnion = IPosition | 
IRange | 
ITypeIdentifier | 
IDecoratorLiteral | 
IDecorator | 
IIdentified | 
IDeclaration | 
IMapKeyType | 
IMapValueType | 
IEnumProperty | 
IProperty | 
IStringRegexValidator | 
IStringLengthValidator | 
IDoubleDomainValidator | 
IIntegerDomainValidator | 
ILongDomainValidator | 
IAliasedType | 
IImport | 
IModel | 
IModels | 
INode | 
IAttribute | 
ITagInfo | 
ICode;

export interface IAsset extends IConcept {
  $identifier: string;
}

export interface IParticipant extends IConcept {
  $identifier: string;
}

export interface ITransaction extends IConcept {
  $timestamp: Date;
}

export interface IEvent extends IConcept {
  $timestamp: Date;
}

