import { User, CreditCard, MapPin, GraduationCap, Download, Calendar } from 'lucide-react';

interface StudentAccountProps {
  user: { 
    name: string; 
    email: string;
    studentId?: string;
    department?: string;
    roomNumber?: string;
  };
}

// Mock payment data (still mock for now as backend doesn't have payments yet)
const paymentData = {
  lastPayment: {
    amount: 8500,
    date: '2024-11-01',
    transactionId: 'TXN-20241101-4567',
    semester: 'Fall 2024',
    receiptUrl: '#'
  }
};

export function StudentAccount({ user }: StudentAccountProps) {
  const handleDownloadReceipt = () => {
    // Mock download functionality
    alert('Receipt download functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="mb-6 flex items-center gap-2">
          <User className="size-6 text-indigo-600" />
          Student Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border-b pb-3">
              <p className="text-sm text-gray-600 mb-1">Full Name</p>
              <p className="text-lg">{user.name}</p>
            </div>
            
            <div className="border-b pb-3">
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <GraduationCap className="size-4" />
                Student ID
              </p>
              <p className="text-lg">{user.studentId || 'Not set'}</p>
            </div>
            
            <div className="border-b pb-3">
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="text-lg">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-b pb-3">
              <p className="text-sm text-gray-600 mb-1">Department</p>
              <p className="text-lg">{user.department || 'Not set'}</p>
            </div>
            
            <div className="border-b pb-3">
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <MapPin className="size-4" />
                Room Number
              </p>
              <p className="text-lg">{user.roomNumber || 'Not set'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Last Payment Receipt */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="mb-6 flex items-center gap-2">
          <CreditCard className="size-6 text-green-600" />
          Last Hall Fee Payment
        </h2>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Payment for</p>
              <p className="text-xl text-green-900">{paymentData.lastPayment.semester}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
              <p className="text-2xl text-green-900">৳{paymentData.lastPayment.amount.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-2">
              <Calendar className="size-5 text-green-700 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Payment Date</p>
                <p className="text-green-900">
                  {new Date(paymentData.lastPayment.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Transaction ID</p>
              <p className="text-green-900 font-mono text-sm">{paymentData.lastPayment.transactionId}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-green-200">
            <button
              onClick={handleDownloadReceipt}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="size-5" />
              Download Receipt
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Note:</span> Next payment is due on December 1, 2024 for Spring 2025 semester.
          </p>
        </div>
      </div>
    </div>
  );
}
