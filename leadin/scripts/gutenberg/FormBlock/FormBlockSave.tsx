import React from 'react';
import * as WpBlockEditorApi from '@wordpress/block-editor';
import { RawHTML } from '@wordpress/element';
import { IFormBlockAttributes } from './registerFormBlock';

export default function FormSaveBlock({ attributes }: IFormBlockAttributes) {
  const { portalId, formId } = attributes;

  if (!WpBlockEditorApi) {
    return null;
  }

  if (portalId && formId) {
    return (
      <RawHTML {...WpBlockEditorApi.useBlockProps.save()}>
        {`[hubspot portal="${portalId}" id="${formId}" type="form"]`}
      </RawHTML>
    );
  }
  return null;
}
