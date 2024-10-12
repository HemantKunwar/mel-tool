// app/components/DatePicker.tsx

import React from 'react';
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
  id: string;
  name: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ id, name }) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  return (
    <ReactDatePicker
      id={id}
      name={name}
      selected={selectedDate}
      onChange={(date: Date | null) => setSelectedDate(date)}
      dateFormat="yyyy-MM-dd"
    />
  );
};