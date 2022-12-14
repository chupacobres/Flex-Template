import { ITask, useFlexSelector, Manager } from '@twilio/flex-ui';
import React, { FC } from 'react';
import moment from 'moment';
import 'moment-timezone';
import { TaskAttributes } from 'types/task-router/Task';
import { Button, Box, Heading, Paragraph, Flex as Flex } from "@twilio-paste/core";
import { InformationIcon } from "@twilio-paste/icons/esm/InformationIcon";
import { useDispatch, useSelector } from 'react-redux';
import { AppState, reduxNamespace } from '../../../../flex-hooks/states'
import { Actions } from "../../flex-hooks/states/CallbackAndVoicemail"


type CallbackAndVoicemailProps = {
  task: ITask,
  allowRequeue: boolean,
  maxAttempts: number,
}

export const CallbackAndVoicemail = ({ task, allowRequeue, maxAttempts }: CallbackAndVoicemailProps) => {
  const dispatch = useDispatch();

  const {
    isCompletingCallbackAction,
    isRequeueingCallbackAction
  } = useSelector((state: AppState) => state[reduxNamespace].callbackAndVoicemail);

  const workerActivitySid = useFlexSelector(state => state.flex.worker?.activity?.sid);
  const workerOffline = (workerActivitySid: string) => {return workerActivitySid === Manager.getInstance().serviceConfiguration.taskrouter_offline_activity_sid}
  

  const taskStatus = task?.taskStatus
  const { taskType, callBackData } = task?.attributes as TaskAttributes
  const timeReceived = moment(callBackData?.utcDateTimeReceived);
  const localTz = moment.tz.guess();
  const localTimeShort = timeReceived.tz(localTz).format('MM-D-YYYY, h:mm:ss a z');
  const serverTimeShort = 'System time: ' + timeReceived.tz(callBackData?.mainTimeZone || localTz).format('MM-D-YYYY, h:mm:ss a z');
  const disableRetryButton = taskStatus !== 'assigned' || isCompletingCallbackAction[task.taskSid] || isRequeueingCallbackAction[task.taskSid]
  const disableCallCustomerButton = disableRetryButton || workerOffline(workerActivitySid)
  const thisAttempt = callBackData?.attempts ? (Number(callBackData.attempts) + 1) : 1

  return (
    <>
    <Flex vertical>    
      {taskType == 'callback' &&
        <Box element="C_AND_V_CONTENT_BOX">
          <Heading element="C_AND_V_CONTENT_HEADING" as="h4" variant="heading40">Callback Request</Heading>
          <Paragraph element="C_AND_V_CONTENT_PARAGRAPH">A contact has requested an immediate callback.</Paragraph>
        </Box>
      }

      {taskType == 'voicemail' &&
        <Box element="C_AND_V_CONTENT_BOX">
          <Heading element="C_AND_V_CONTENT_HEADING" as="h4" variant="heading40">Contact Voicemail</Heading>
          <Paragraph element="C_AND_V_CONTENT_PARAGRAPH">A contact has left a voicemail that requires attention.</Paragraph> 
        </Box>
      }      
      
      {callBackData.recordingUrl && !callBackData.isDeleted &&
        <Box element="C_AND_V_CONTENT_BOX">
          <Heading element="C_AND_V_CONTENT_HEADING" as="h4" variant="heading40">Voicemail recording</Heading>
          <Paragraph element="C_AND_V_CONTENT_PARAGRAPH"><audio src={callBackData.recordingUrl} controls /></Paragraph>
        </Box>
      }    
      
      {callBackData.transcriptText && !callBackData.isDeleted &&
          <Box element="C_AND_V_CONTENT_BOX">
            <Heading element="C_AND_V_CONTENT_HEADING" as="h4" variant="heading40">Voicemail transcript</Heading>
            <Paragraph element="C_AND_V_CONTENT_PARAGRAPH">{callBackData.transcriptText}</Paragraph>
          </Box>
        }
      
      <Box element="C_AND_V_CONTENT_BOX">
        <Heading element="C_AND_V_CONTENT_HEADING" as="h4" variant="heading40">Contact phone</Heading>
        <Paragraph element="C_AND_V_CONTENT_PARAGRAPH">{callBackData?.numberToCall}</Paragraph>
      </Box>

      <Box element="C_AND_V_CONTENT_BOX">
        <Heading element="C_AND_V_CONTENT_HEADING" as="h4" variant="heading40">Call reception time</Heading>
        <Flex vAlignContent="center">
          <Flex>
            <Box>
              {localTimeShort}
            </Box>
          </Flex>
          <Flex grow>
            <Box paddingLeft="space10">
              <InformationIcon decorative={false} title={serverTimeShort}/>
            </Box>
          </Flex>
        </Flex>
      </Box>  

      { allowRequeue &&
        <Box element="C_AND_V_CONTENT_BOX">
          <Heading element="C_AND_V_CONTENT_HEADING" as="h4" variant="heading40">Callback attempt</Heading>
          <Paragraph element="C_AND_V_CONTENT_PARAGRAPH">{thisAttempt} of { maxAttempts}</Paragraph>
        </Box>
      }
      </Flex>
    
      <Box element="C_AND_V_BUTTON_BOX">
        <Button fullWidth
          disabled={disableCallCustomerButton}
          variant="primary"
          onClick={() => dispatch(Actions.callCustomer(task))}
        >
            Place Call Now To {callBackData?.numberToCall}
        </Button>
        </Box>
   
      
      { allowRequeue && thisAttempt <  maxAttempts &&
        <Box element="C_AND_V_BUTTON_BOX">
          <Button fullWidth
            disabled={disableRetryButton}
            variant="secondary"
            onClick={async () => dispatch(Actions.requeueCallback(task))}
          >
            Retry Later
          </Button>
        </Box>
  }
  </>
      
  );
}

