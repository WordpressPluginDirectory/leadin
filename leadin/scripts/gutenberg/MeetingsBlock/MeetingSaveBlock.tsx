import React from 'react';
import { RawHTML } from '@wordpress/element';
import * as BlockEditorApi from '@wordpress/block-editor';
import { IMeetingBlockAttributes } from './registerMeetingBlock';

export default function MeetingSaveBlock({
  attributes,
}: IMeetingBlockAttributes) {
  const { url } = attributes;

  if (!BlockEditorApi) {
    return null;
  }

  if (url) {
    return (
      <RawHTML
        {...BlockEditorApi.useBlockProps.save()}
      >{`[hubspot url="${url}" type="meeting"]`}</RawHTML>
    );
  }
  return null;
}
