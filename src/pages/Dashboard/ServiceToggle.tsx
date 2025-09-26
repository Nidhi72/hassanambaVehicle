import  { useState, useEffect } from 'react';
import ComponentCard from "../../components/common/ComponentCard";
import Switch from "../../components/form/switch/Switch";
import config from '../../config';

export default function ServiceToggle() {
  const [toggles, setToggles] = useState({
    booking: false,
    donation: false
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({
    booking: false,
    donation: false
  });

  // Fetch current toggle states on component mount
  useEffect(() => {
    fetchToggleStates();
  }, []);

  const fetchToggleStates = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch(`${config.baseURL}/servicetoggles`);
      const data = await response.json();
      
      if (data.success) {
        setToggles({
          booking: data.data.enable_booking === 1,
          donation: data.data.enable_donation === 1
        });
      }
    } catch (error) {
      console.error('Error fetching toggle states:', error);
      // You might want to show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = async (service: string, checked: boolean) => {
    setUpdating(prev => ({ ...prev, [service]: true }));
    
    try {
        const response = await fetch(`${config.baseURL}/servicetoggles/${service}`, {
            method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: checked ? 1 : 0
        })
      });

      const result = await response.json();

      if (result.success) {
        setToggles(prev => ({
          ...prev,
          [service]: checked
        }));
        console.log(result.message);
        // You might want to show a success toast notification here
      } else {
        console.error('Error:', result.message);
        // You might want to show an error toast notification here
      }
    } catch (error) {
      console.error(`Error updating ${service} toggle:`, error);
      // You might want to show an error toast notification here
    } finally {
      setUpdating(prev => ({ ...prev, [service]: false }));
    }
  };

  const handleBookingChange = (checked: boolean) => {
    handleToggleChange('booking', checked);
  };

  const handleDonationChange = (checked: boolean) => {
    handleToggleChange('donation', checked);
  };

  if (loading) {
    return (
      <ComponentCard title="Service Toggles">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading service states...</span>
        </div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Service Toggles">
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Service Management</h3>
            <p className="text-sm text-gray-600">
              Enable or disable core services for your platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Booking Service</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Allow users to make bookings
                  </p>
                </div>
                <div className="relative">
                  {updating.booking && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  <Switch
                    label=""
                    defaultChecked={toggles.booking}
                    onChange={handleBookingChange}
                    disabled={updating.booking}
                    color="blue"
                  />
                </div>
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  toggles.booking 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {toggles.booking ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Donation Service</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Allow users to make donations
                  </p>
                </div>
                <div className="relative">
                  {updating.donation && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  <Switch
                    label=""
                    defaultChecked={toggles.donation}
                    onChange={handleDonationChange}
                    disabled={updating.donation}
                    color="blue"
                  />
                </div>
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  toggles.donation 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {toggles.donation ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Changes to service toggles will take effect immediately. 
                Users will be affected by these changes in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}