//This likely contains logic for the AI Assistant feature
//that handles user input.
//Display of assistant responses.
//Possibly calls to an API or context.
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Bot, User, Loader } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { RootState } from '../../store';
import { sendMessage, addUserMessage } from '../../store/slices/aiAssistantSlice';
import { updateFormFromAiResponse } from '../../store/slices/interactionSlice';
import { AppDispatch } from '../../store';

const AiAssistant: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  
  const { messages, isTyping } = useSelector((state: RootState) => state.aiAssistant);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message to chat
    dispatch(addUserMessage(inputValue));
    
    // Send to AI and process response
    const result = await dispatch(sendMessage(inputValue));
    
    // Update form if AI extracted information
    if (sendMessage.fulfilled.match(result)) {
      dispatch(updateFormFromAiResponse(result.payload.formUpdates));
    }
    
    // Clear input
    setInputValue('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto mb-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-neutral-500">
              <Bot className="h-12 w-12 mb-4 text-primary-500" />
              <p className="font-medium text-lg">AI Assistant Ready</p>
              <p className="mt-2 text-sm max-w-md">
                Describe your HCP interaction in natural language, and I'll help extract and organize the information.
              </p>
              <div className="mt-4 text-sm bg-neutral-100 p-4 rounded-md max-w-md">
                <p className="italic">Example: "Met Dr. Patel at 10:30 on April 19 to discuss OncoBoost. Shared Phase III trial results. Sentiment was positive. Agreed to next follow-up in 2 weeks."</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user' 
                      ? 'bg-primary-600 text-white rounded-tr-none'
                      : 'bg-neutral-100 text-neutral-800 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {message.role === 'assistant' ? (
                      <Bot className="h-4 w-4 mr-1 text-primary-600" />
                    ) : (
                      <User className="h-4 w-4 mr-1 text-white" />
                    )}
                    <span className="text-xs font-medium">
                      {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-neutral-100 text-neutral-800 rounded-tl-none">
                <div className="flex items-center">
                  <Bot className="h-4 w-4 mr-1 text-primary-600" />
                  <span className="text-xs font-medium">AI Assistant</span>
                </div>
                <div className="flex items-center mt-1">
                  <Loader className="h-4 w-4 mr-2 animate-spin text-primary-600" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-neutral-200 pt-4">
        <div className="flex w-full">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Describe your HCP interaction..."
            className="flex-1"
          />
          <Button 
            variant="primary"
            className="ml-2"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AiAssistant;