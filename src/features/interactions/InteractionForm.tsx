//it is a sub component od ai assistant
//An input box or chat form.
//Submit button logic.
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, MessageCircle, Smile, Users } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { RootState } from '../../store';
import { 
  setHcpName, 
  setInteractionType, 
  setDate, 
  setTime, 
  setTopicsDiscussed,
  setHcpSentiment,
  setOutcomes,
  setFollowUpActions,
  resetInteractionForm
} from '../../store/slices/interactionSlice';
import useAnimatedFormField from '../../hooks/useAnimatedFormField';

const InteractionForm: React.FC = () => {
  const dispatch = useDispatch();
  const interaction = useSelector((state: RootState) => state.interaction);
  
  const hcpNameAnimation = useAnimatedFormField({ fieldName: 'hcpName' });
  const interactionTypeAnimation = useAnimatedFormField({ fieldName: 'interactionType' });
  const dateAnimation = useAnimatedFormField({ fieldName: 'date' });
  const timeAnimation = useAnimatedFormField({ fieldName: 'time' });
  const topicsDiscussedAnimation = useAnimatedFormField({ fieldName: 'topicsDiscussed' });
  const hcpSentimentAnimation = useAnimatedFormField({ fieldName: 'hcpSentiment' });
  const outcomesAnimation = useAnimatedFormField({ fieldName: 'outcomes' });
  const followUpActionsAnimation = useAnimatedFormField({ fieldName: 'followUpActions' });
  const aiSuggestedFollowUpsAnimation = useAnimatedFormField({ fieldName: 'aiSuggestedFollowUps' });
  
  return (
    <Card className="w-full h-full overflow-y-auto">
      <CardHeader>
        <CardTitle>Log HCP Interaction</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className={`form-group ${hcpNameAnimation}`}>
              <Input
                label="HCP Name"
                value={interaction.hcpName}
                onChange={(e) => dispatch(setHcpName(e.target.value))}
                placeholder="Dr. John Smith"
                leftIcon={<Users className="h-5 w-5 text-neutral-400" />}
              />
            </div>
            
            <div className={`form-group ${interactionTypeAnimation}`}>
              <Select
                label="Interaction Type"
                value={interaction.interactionType}
                onChange={(value) => dispatch(setInteractionType(value as 'Meeting' | 'Call' | ''))}
                options={[
                  { value: '', label: 'Select type...' },
                  { value: 'Meeting', label: 'Meeting' },
                  { value: 'Call', label: 'Call' }
                ]}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className={`form-group ${dateAnimation}`}>
              <Input
                label="Date"
                type="date"
                value={interaction.date}
                onChange={(e) => dispatch(setDate(e.target.value))}
                leftIcon={<Calendar className="h-5 w-5 text-neutral-400" />}
              />
            </div>
            
            <div className={`form-group ${timeAnimation}`}>
              <Input
                label="Time"
                type="time"
                value={interaction.time}
                onChange={(e) => dispatch(setTime(e.target.value))}
                leftIcon={<Clock className="h-5 w-5 text-neutral-400" />}
              />
            </div>
          </div>
          
          <div className={`form-group ${topicsDiscussedAnimation}`}>
            <Textarea
              label="Topics Discussed"
              value={interaction.topicsDiscussed}
              onChange={(e) => dispatch(setTopicsDiscussed(e.target.value))}
              placeholder="Enter topics discussed during the interaction..."
              rows={3}
            />
          </div>
          
          <div className={`form-group ${hcpSentimentAnimation}`}>
            <label className="form-label mb-2">HCP Sentiment</label>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={interaction.hcpSentiment === 'Positive' ? 'primary' : 'outline'}
                onClick={() => dispatch(setHcpSentiment('Positive'))}
                leftIcon={<Smile className="h-5 w-5" />}
              >
                Positive
              </Button>
              <Button
                type="button"
                variant={interaction.hcpSentiment === 'Neutral' ? 'primary' : 'outline'}
                onClick={() => dispatch(setHcpSentiment('Neutral'))}
                leftIcon={<Smile className="h-5 w-5" />}
              >
                Neutral
              </Button>
              <Button
                type="button"
                variant={interaction.hcpSentiment === 'Negative' ? 'primary' : 'outline'}
                onClick={() => dispatch(setHcpSentiment('Negative'))}
                leftIcon={<Smile className="h-5 w-5" />}
              >
                Negative
              </Button>
            </div>
          </div>
          
          <div className={`form-group ${outcomesAnimation}`}>
            <Textarea
              label="Outcomes"
              value={interaction.outcomes}
              onChange={(e) => dispatch(setOutcomes(e.target.value))}
              placeholder="Enter outcomes of the interaction..."
              rows={3}
            />
          </div>
          
          <div className={`form-group ${followUpActionsAnimation}`}>
            <Textarea
              label="Follow-Up Actions"
              value={interaction.followUpActions}
              onChange={(e) => dispatch(setFollowUpActions(e.target.value))}
              placeholder="Enter follow-up actions..."
              rows={3}
            />
          </div>
          
          <div className={`form-group ${aiSuggestedFollowUpsAnimation}`}>
            <label className="form-label mb-2">AI Suggested Follow-Ups</label>
            {interaction.aiSuggestedFollowUps.length > 0 ? (
              <div className="space-y-2">
                {interaction.aiSuggestedFollowUps.map((suggestion, index) => (
                  <div key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 text-primary-700 text-sm mr-2">
                      {index + 1}
                    </span>
                    <p className="text-neutral-700">{suggestion}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-sm italic">
                The AI assistant will suggest follow-up actions based on your interaction.
              </p>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => dispatch(resetInteractionForm())}
        >
          Clear Form
        </Button>
        
        <Button
          type="button"
          variant="primary"
        >
          Save Interaction
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InteractionForm;