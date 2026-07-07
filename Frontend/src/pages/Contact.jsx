import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../api/axios';
import { useLang } from '../context/LangContext';

export default function Contact() {
  const { t } = useLang();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  async function onSubmit(values) {
    try {
      await api.post('/inquiries', {
        customerName: values.name,
        mobileNumber: values.mobile,
        message: values.message,
      });
      toast.success('Your enquiry has been sent!');
      reset();
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="container-shop py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl md:text-4xl text-ink">{t('contact_heading')}</h1>
        <div className="chain-divider mt-4"><span /><span /><span /><span /><span /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <FaPhone className="text-gold-dark mt-1" />
            <div>
              <p className="font-display text-lg text-ink">Call Us</p>
              <p className="text-ink/60 text-sm">+91 94230 33383</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <FaEnvelope className="text-gold-dark mt-1" />
            <div>
              <p className="font-display text-lg text-ink">Email</p>
              <p className="text-ink/60 text-sm">anita.pradip.jadhav@gmail.com</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <FaMapMarkerAlt className="text-gold-dark mt-1" />
            <div>
              <p className="font-display text-lg text-ink">Visit Us</p>
              <p className="text-ink/60 text-sm">
                Near Maruti Temple,<br />
                Malegaon BK, Baramati,<br />
                Pune - 413115
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register('name', { required: true })}
              placeholder={t('contact_name')}
              className="w-full border border-gold/25 rounded-xl px-4 py-3 focus:border-gold outline-none"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">Name is required</p>}
          </div>
          <div>
            <input
              {...register('mobile', { required: true, pattern: /^[0-9]{10}$/ })}
              placeholder={t('contact_mobile')}
              className="w-full border border-gold/25 rounded-xl px-4 py-3 focus:border-gold outline-none"
            />
            {errors.mobile && <p className="text-xs text-red-500 mt-1">Enter a valid 10-digit mobile number</p>}
          </div>
          <div>
            <textarea
              {...register('message')}
              rows={4}
              placeholder={t('contact_message')}
              className="w-full border border-gold/25 rounded-xl px-4 py-3 focus:border-gold outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-ink text-gold font-medium py-3.5 rounded-full hover:bg-gold-dark hover:text-ink transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Sending...' : t('contact_send')}
          </button>
        </form>
      </div>
    </div>
  );
}
