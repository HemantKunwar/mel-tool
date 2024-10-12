// app/components/StatusDropdown.tsx

import React from 'react';

interface StatusDropdownProps {
  id: string;
  name: string;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({ id, name }) => {
  return (
    <select id={id} name={name} required>
      <option value="ON_TRACK">On Track</option>
      <option value="AT_RISK">At Risk</option>
      <option value="DELAYED">Delayed</option>
      <option value="COMPLETED">Completed</option>
    </select>
  );
};