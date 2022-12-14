import * as Flex from '@twilio/flex-ui';
import OutboundCallerIDSelector from '../../custom-components/OutboundCallerIDSelector'

import { UIAttributes } from 'types/manager/ServiceConfiguration';

const { custom_data } = Flex.Manager.getInstance().serviceConfiguration.ui_attributes as UIAttributes;
const { enabled = false } = custom_data?.features?.caller_id || {}

export function addOutboundCallerIdSelectorToMainHeader(flex: typeof Flex) {

  if(!enabled) return;
  
  flex.OutboundDialerPanel.Content.add(<OutboundCallerIDSelector key="outbound-callerid-selector" />, {
    sortOrder: 1,
  });
}
