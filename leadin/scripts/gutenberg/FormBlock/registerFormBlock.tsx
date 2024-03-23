import React from 'react';
import * as WpBlocksApi from '@wordpress/blocks';
import SprocketIcon from '../Common/SprocketIcon';
import FormBlockSave from './FormBlockSave';
import { connectionStatus } from '../../constants/leadinConfig';
import FormGutenbergPreview from './FormGutenbergPreview';
import ErrorHandler from '../../shared/Common/ErrorHandler';
import FormEdit from '../../shared/Form/FormEdit';
import ConnectionStatus from '../../shared/enums/connectionStatus';
import { __ } from '@wordpress/i18n';

export interface IFormBlockAttributes {
  attributes: {
    portalId: string;
    formId: string;
    preview?: boolean;
    formName: string;
  };
}

export interface IFormBlockProps extends IFormBlockAttributes {
  setAttributes: Function;
  isSelected: boolean;
}

export default function registerFormBlock() {
  const editComponent = (props: IFormBlockProps) => {
    if (props.attributes.preview) {
      return <FormGutenbergPreview />;
    } else if (connectionStatus === ConnectionStatus.Connected) {
      return <FormEdit {...props} origin="gutenberg" preview={true} />;
    } else {
      return <ErrorHandler status={401} />;
    }
  };

  if (!WpBlocksApi) {
    return null;
  }

  WpBlocksApi.registerBlockType('leadin/hubspot-form-block', {
    title: __('HubSpot Form', 'leadin'),
    description: __('Select and embed a HubSpot form', 'leadin'),
    icon: SprocketIcon,
    category: 'leadin-blocks',
    attributes: {
      portalId: {
        type: 'string',
        default: '',
      } as WpBlocksApi.BlockAttribute<string>,
      formId: {
        type: 'string',
      } as WpBlocksApi.BlockAttribute<string>,
      formName: {
        type: 'string',
      } as WpBlocksApi.BlockAttribute<string>,
      preview: {
        type: 'boolean',
        default: false,
      } as WpBlocksApi.BlockAttribute<boolean>,
    },
    example: {
      attributes: {
        preview: true,
      },
    },
    edit: editComponent,
    save: props => <FormBlockSave {...props} />,
  });
}
