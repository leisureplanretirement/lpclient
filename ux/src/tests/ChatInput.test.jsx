import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatInput from '../components/ChatInput';

describe('ChatInput', () => {
  it('calls onSend with input value', () => {
    const onSend = jest.fn();
    render(<ChatInput onSend={onSend} loading={false} />);
    const input = screen.getByPlaceholderText(/type your message/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(input.closest('form'));
    expect(onSend).toHaveBeenCalledWith('Hello');
  });
});
