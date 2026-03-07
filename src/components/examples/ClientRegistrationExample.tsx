import React, { useState, useEffect } from 'react';
import { 
  useValidateInviteCodeMutation,
  useRegisterClientMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useGetAgencyPublicInfoQuery
} from '../../store/slices/clientRegistrationSlice';

export const ClientRegistrationExample: React.FC = () => {
  const [step, setStep] = useState<'invite' | 'register' | 'verify' | 'success'>('invite');
  const [inviteCode, setInviteCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    contactName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    companySize: 'SMALL' as const,
    industry: '',
    website: '',
    description: '',
  });

  // Mutations and queries
  const [validateInviteCode, { isLoading: isValidating, error: validateError }] = useValidateInviteCodeMutation();
  const [registerClient, { isLoading: isRegistering, error: registerError }] = useRegisterClientMutation();
  const [verifyEmail, { isLoading: isVerifying, error: verifyError }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();
  
  // Get agency info for branding
  const { data: agencyInfo, isLoading: isLoadingAgency } = useGetAgencyPublicInfoQuery(
    inviteCode,
    { skip: !inviteCode || inviteCode.length < 6 }
  );

  // Handle invite code validation
  const handleValidateInviteCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await validateInviteCode({ inviteCode }).unwrap();
      if (result.isValid) {
        setStep('register');
      }
    } catch (error) {
      console.error('Invalid invite code:', error);
    }
  };

  // Handle client registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await registerClient({ inviteCode, ...formData }).unwrap();
      if (result.verificationEmailSent) {
        setStep('verify');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  // Handle email verification
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await verifyEmail({ token: verificationToken }).unwrap();
      if (result.success) {
        setStep('success');
      }
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  // Handle resend verification
  const handleResendVerification = async () => {
    try {
      await resendVerification({ email: formData.contactEmail }).unwrap();
      alert('Verification email resent!');
    } catch (error) {
      console.error('Failed to resend verification:', error);
    }
  };

  // Render agency branding if available
  const renderAgencyBranding = () => {
    if (!agencyInfo) return null;
    
    return (
      <div style={{ 
        backgroundColor: agencyInfo.primaryColor || '#f0f8ff',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        {agencyInfo.logo && (
          <img 
            src={agencyInfo.logo} 
            alt={agencyInfo.name}
            style={{ height: '60px', marginBottom: '10px' }}
          />
        )}
        <h2 style={{ color: agencyInfo.secondaryColor || '#333' }}>
          Welcome to {agencyInfo.name}
        </h2>
        {agencyInfo.description && (
          <p style={{ color: '#666' }}>{agencyInfo.description}</p>
        )}
      </div>
    );
  };

  return (
    <div className="client-registration-example" style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {renderAgencyBranding()}
      
      <h1>Client Registration</h1>
      
      {/* Step 1: Invite Code Validation */}
      {step === 'invite' && (
        <div>
          <h3>Step 1: Enter Your Invite Code</h3>
          <form onSubmit={handleValidateInviteCode}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Invite Code:
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter your invite code"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            {validateError && (
              <div style={{ 
                color: 'red', 
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#ffebee',
                borderRadius: '4px'
              }}>
                Invalid invite code. Please check and try again.
              </div>
            )}
            
            <button
              type="submit"
              disabled={isValidating || isLoadingAgency}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: agencyInfo?.primaryColor || '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: isValidating ? 'not-allowed' : 'pointer'
              }}
            >
              {isValidating ? 'Validating...' : 'Continue'}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Registration Form */}
      {step === 'register' && (
        <div>
          <h3>Step 2: Company Registration</h3>
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '15px' }}>
              <label>Company Name:</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Contact Name:</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Contact Email:</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Contact Phone:</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Industry:</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Company Size:</label>
              <select
                value={formData.companySize}
                onChange={(e) => setFormData({...formData, companySize: e.target.value as any})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="SMALL">Small (1-50 employees)</option>
                <option value="MEDIUM">Medium (51-200 employees)</option>
                <option value="LARGE">Large (201-1000 employees)</option>
                <option value="ENTERPRISE">Enterprise (1000+ employees)</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Billing Address:</label>
              <input
                type="text"
                placeholder="Street"
                value={formData.billingAddress.street}
                onChange={(e) => setFormData({
                  ...formData, 
                  billingAddress: {...formData.billingAddress, street: e.target.value}
                })}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '5px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="City"
                  value={formData.billingAddress.city}
                  onChange={(e) => setFormData({
                    ...formData, 
                    billingAddress: {...formData.billingAddress, city: e.target.value}
                  })}
                  required
                  style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <input
                  type="text"
                  placeholder="State"
                  value={formData.billingAddress.state}
                  onChange={(e) => setFormData({
                    ...formData, 
                    billingAddress: {...formData.billingAddress, state: e.target.value}
                  })}
                  required
                  style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
            
            {registerError && (
              <div style={{ 
                color: 'red', 
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#ffebee',
                borderRadius: '4px'
              }}>
                Registration failed. Please try again.
              </div>
            )}
            
            <button
              type="submit"
              disabled={isRegistering}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: agencyInfo?.primaryColor || '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: isRegistering ? 'not-allowed' : 'pointer'
              }}
            >
              {isRegistering ? 'Registering...' : 'Register Company'}
            </button>
          </form>
        </div>
      )}

      {/* Step 3: Email Verification */}
      {step === 'verify' && (
        <div>
          <h3>Step 3: Verify Your Email</h3>
          <p>We've sent a verification email to <strong>{formData.contactEmail}</strong></p>
          <p>Please enter the verification token from the email:</p>
          
          <form onSubmit={handleVerifyEmail}>
            <div style={{ marginBottom: '15px' }}>
              <label>Verification Token:</label>
              <input
                type="text"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                placeholder="Enter verification token"
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  fontSize: '16px',
                  textAlign: 'center',
                  letterSpacing: '2px'
                }}
              />
            </div>
            
            {verifyError && (
              <div style={{ 
                color: 'red', 
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#ffebee',
                borderRadius: '4px'
              }}>
                Invalid verification token. Please check your email and try again.
              </div>
            )}
            
            <button
              type="submit"
              disabled={isVerifying}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: agencyInfo?.primaryColor || '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: isVerifying ? 'not-allowed' : 'pointer',
                marginBottom: '10px'
              }}
            >
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
          
          <button
            onClick={handleResendVerification}
            disabled={isResending}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'transparent',
              color: agencyInfo?.primaryColor || '#007bff',
              border: `1px solid ${agencyInfo?.primaryColor || '#007bff'}`,
              borderRadius: '4px',
              fontSize: '14px',
              cursor: isResending ? 'not-allowed' : 'pointer'
            }}
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 'success' && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ 
            fontSize: '60px', 
            color: '#4caf50',
            marginBottom: '20px'
          }}>
            ✅
          </div>
          <h2>Registration Complete!</h2>
          <p>Your company has been successfully registered and verified.</p>
          <p>You can now log in to your client portal.</p>
          
          <button
            onClick={() => window.location.href = '/client/login'}
            style={{
              padding: '12px 30px',
              backgroundColor: agencyInfo?.primaryColor || '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Go to Client Login
          </button>
        </div>
      )}
    </div>
  );
};
