export default {
  name: 'HelpSupport',
  data() {
    return {
      documentFAQs: [
        {
          id: 'doc-1',
          question: 'How do I request a Barangay Clearance?',
          answer: 'To request a Barangay Clearance:<br>1. Go to "Available Services" in the sidebar<br>2. Select "Barangay Clearance"<br>3. Fill out the required information<br>4. Submit your request<br>5. Pay the ₱50 fee<br>6. Your clearance will be processed the same day',
          expanded: false
        },
        {
          id: 'doc-2',
          question: 'What documents do I need to provide?',
          answer: 'For most document requests, you need:<br>• Valid government-issued ID<br>• Proof of residency in Barangay Bula<br>• Completed application form<br>• Payment of applicable fees<br><br>Specific requirements may vary by document type.',
          expanded: false
        },
        {
          id: 'doc-3',
          question: 'How long does document processing take?',
          answer: 'Processing times vary by document type:<br>• Barangay Clearance: Same day<br>• Cedula: Same day<br>• Certificate of Residency: Same day<br>• Certificate of Indigency: 1-2 business days<br>• Business Permit: 2-3 business days',
          expanded: false
        },
        {
          id: 'doc-4',
          question: 'Can I track my document request status?',
          answer: 'Yes! You can track your request status by:<br>1. Going to "My Requests" in the sidebar<br>2. Viewing the status of each request<br>3. Receiving notifications when status changes<br><br>Status options include: Pending, Processing, Ready for Pickup, Completed',
          expanded: false
        },
        {
          id: 'doc-5',
          question: 'What if my request is rejected?',
          answer: 'If your request is rejected:<br>1. You will receive a notification with the reason<br>2. Review the rejection reason carefully<br>3. Correct any issues or provide missing documents<br>4. Submit a new request<br><br>Common rejection reasons include incomplete information or missing requirements.',
          expanded: false
        }
      ],
      accountFAQs: [
        {
          id: 'acc-1',
          question: 'How do I create an account?',
          answer: 'To create an account:<br>1. Click "Register" on the login page<br>2. Fill out your personal information<br>3. Provide a valid email address<br>4. Create a secure password<br>5. Verify your email address<br>6. Wait for account approval from barangay staff',
          expanded: false
        },
        {
          id: 'acc-2',
          question: 'I forgot my password. How do I reset it?',
          answer: 'To reset your password:<br>1. Click "Forgot Password" on the login page<br>2. Enter your email address<br>3. Check your email for reset instructions<br>4. Click the reset link in the email<br>5. Create a new password<br><br>If you don\'t receive the email, check your spam folder.',
          expanded: false
        },
        {
          id: 'acc-3',
          question: 'How do I update my profile information?',
          answer: 'To update your profile:<br>1. Go to "My Profile" in the sidebar<br>2. Click "Edit Profile"<br>3. Update your information<br>4. Click "Save Changes"<br><br>Note: Some changes may require verification by barangay staff.',
          expanded: false
        },
        {
          id: 'acc-4',
          question: 'Why is my account pending approval?',
          answer: 'New accounts require approval to ensure:<br>• You are a legitimate resident of Barangay Bula<br>• Your information is accurate<br>• System security is maintained<br><br>Approval typically takes 1-2 business days. You will receive an email notification once approved.',
          expanded: false
        }
      ],
      paymentFAQs: [
        {
          id: 'pay-1',
          question: 'What payment methods are accepted?',
          answer: 'We accept the following payment methods:<br>• Cash payment at the barangay office<br>• GCash<br>• PayMaya<br>• Bank transfer<br>• Credit/Debit cards (via PayMongo)<br><br>Online payments are processed securely through our payment partners.',
          expanded: false
        },
        {
          id: 'pay-2',
          question: 'When do I need to pay for my document request?',
          answer: 'Payment is required:<br>• Before document processing begins<br>• After submitting your request<br>• Within 24 hours of request submission<br><br>Unpaid requests will be automatically cancelled after 24 hours.',
          expanded: false
        },
        {
          id: 'pay-3',
          question: 'Can I get a refund if I cancel my request?',
          answer: 'Refund policy:<br>• Full refund if cancelled within 1 hour of payment<br>• No refund if processing has already started<br>• Partial refund may be available in special circumstances<br><br>Contact our office for refund requests.',
          expanded: false
        },
        {
          id: 'pay-4',
          question: 'Is my payment information secure?',
          answer: 'Yes, your payment information is secure:<br>• We use SSL encryption for all transactions<br>• Payment processing is handled by certified partners<br>• We do not store your credit card information<br>• All transactions are monitored for fraud<br><br>Your financial security is our priority.',
          expanded: false
        }
      ],
      userGuides: [
        {
          id: 'guide-1',
          title: 'Getting Started',
          description: 'Learn how to create an account and navigate the system',
          icon: 'fas fa-play-circle'
        },
        {
          id: 'guide-2',
          title: 'Requesting Documents',
          description: 'Step-by-step guide to requesting barangay documents',
          icon: 'fas fa-file-alt'
        },
        {
          id: 'guide-3',
          title: 'Making Payments',
          description: 'How to pay for your document requests online',
          icon: 'fas fa-credit-card'
        },
        {
          id: 'guide-4',
          title: 'Tracking Requests',
          description: 'Monitor the status of your document requests',
          icon: 'fas fa-search'
        },
        {
          id: 'guide-5',
          title: 'Managing Your Profile',
          description: 'Update your personal information and settings',
          icon: 'fas fa-user-cog'
        },
        {
          id: 'guide-6',
          title: 'Troubleshooting',
          description: 'Common issues and how to resolve them',
          icon: 'fas fa-tools'
        }
      ]
    };
  },
  methods: {
    toggleFAQ(faqId) {
      // Find the FAQ in all categories
      const allFAQs = [...this.documentFAQs, ...this.accountFAQs, ...this.paymentFAQs];
      const faq = allFAQs.find(f => f.id === faqId);
      if (faq) {
        faq.expanded = !faq.expanded;
      }
    },
    scrollToSection(sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    },
    openGuide(guideId) {
      // This would typically open a detailed guide or navigate to a guide page
      console.log('Opening guide:', guideId);
      
      // For now, show an alert with guide information
      const guide = this.userGuides.find(g => g.id === guideId);
      if (guide) {
        alert(`Opening guide: ${guide.title}\n\n${guide.description}\n\nDetailed guides will be available in a future update.`);
      }
    }
  }
};
