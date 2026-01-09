import React from 'react';
import { FiFacebook, FiPhone, FiHeart, FiCode, FiCoffee, FiZap } from 'react-icons/fi';
import logoImg from '../../assets/icon.png';
import techcombankLogo from '../../assets/techcombank-logo.png';
import qrTechcombank from '../../assets/qr-techcombank.jpg';
import { useTranslation } from '../utils/i18n';

function AboutView() {
  const { t, language } = useTranslation();

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <img src={logoImg} alt="HubogoNote" className="w-24 h-24 mx-auto mb-4 drop-shadow-lg" />
          <h1 className="text-3xl font-bold text-primary-500 mb-2">HubogoNote</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('version')} 1.0.8</p>
        </div>

        {/* Story Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FiCoffee className="text-orange-500" />
            {t('story')}
          </h2>

          <div className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-300 space-y-4">
            <p>
              {t('story_intro')} <strong className="text-primary-500">{t('story_author')}</strong>, {t('story_aka')} <strong className="text-primary-500">Hubogo</strong>.
            </p>

            <p>
              {t('story_p1')} <span className="text-red-500 font-semibold">{t('story_crazy')}</span>.
              {' '}{t('story_p2')} <span className="italic">{t('story_deadline')}</span>.
            </p>

            <p>
              {t('story_p3')}
              <span className="text-orange-500"> {t('story_quote1')}</span>
            </p>

            <p>
              {t('story_worse')} <span className="text-red-500">{t('story_quote2')}</span>
            </p>

            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg my-4">
              <p className="text-red-700 dark:text-red-400 font-medium m-0">
                💀 {t('story_struggle')}
              </p>
            </div>

            <p>
              {t('story_tried')}
            </p>

            <p className="font-medium text-gray-800 dark:text-white">
              {t('story_decided')} <span className="text-primary-500">{t('story_make_own')}</span>
            </p>

            <div className="bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500 p-4 rounded-r-lg my-4">
              <p className="text-primary-700 dark:text-primary-400 m-0">
                <FiZap className="inline mr-2" />
                {t('story_claude')} <strong>Claude AI</strong>, {t('story_nights')} <strong>HubogoNote</strong> {t('story_born')}
              </p>
            </div>

            <p>
              {t('story_helps')}
            </p>

            <ul className="list-none space-y-2 pl-0">
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">✓</span>
                {t('story_benefit1')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">✓</span>
                {t('story_benefit2')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">✓</span>
                {t('story_benefit3')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">✓</span>
                <strong>{t('story_benefit4')}</strong>
              </li>
            </ul>
          </div>
        </div>

        {/* Features highlight */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FiCode className="text-blue-500" />
            {t('built_with')}
          </h2>

          <div className="flex flex-wrap gap-2">
            {['React', 'Tauri', 'TailwindCSS', 'Claude AI', language === 'vi' ? 'Tình yêu ❤️' : 'Love ❤️', language === 'vi' ? 'Cà phê ☕' : 'Coffee ☕'].map(tech => (
              <span
                key={tech}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FiHeart className="text-red-500" />
            {t('contact')}
          </h2>

          <div className="space-y-3">
            <p className="text-gray-600 dark:text-gray-300">
              {t('contact_desc')}
            </p>

            <a
              href="https://facebook.com/hubogo.arch"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <FiFacebook className="text-white" size={20} />
              </div>
              <div>
                <div className="font-medium text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Facebook
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  facebook.com/hubogo.arch
                </div>
              </div>
            </a>

            <a
              href="tel:0915377575"
              className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <FiPhone className="text-white" size={20} />
              </div>
              <div>
                <div className="font-medium text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
                  {t('phone')}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  0915 377 575
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Buy me a coffee Section */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 shadow-lg mb-6 border border-amber-200 dark:border-amber-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FiCoffee className="text-amber-600" />
            {t('buy_coffee')} ☕
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('coffee_desc')}
          </p>

          {language === 'vi' ? (
            /* Vietnamese - Techcombank */
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-dashed border-amber-300 dark:border-amber-700">
              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <div className="bg-white p-2 rounded-xl shadow-md">
                  <img
                    src={qrTechcombank}
                    alt="QR Techcombank"
                    className="w-48 h-48 object-contain rounded-lg"
                  />
                </div>
              </div>

              {/* Bank info */}
              <div className="flex items-center gap-4">
                {/* Techcombank Logo */}
                <img
                  src={techcombankLogo}
                  alt="Techcombank"
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Techcombank</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white font-mono tracking-wider">
                    8084666889
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    NGUYEN HUY HUNG
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('8084666889');
                    alert(t('copied'));
                  }}
                  className="px-3 py-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium transition-colors"
                >
                  {t('copy_account')}
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center">
                  💡 {t('coffee_qr_hint')} <span className="font-medium text-amber-600 dark:text-amber-400">{t('coffee_message')}</span>
                </p>
              </div>
            </div>
          ) : (
            /* English - PayPal */
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-dashed border-blue-300 dark:border-blue-700">
              {/* PayPal Logo */}
              <div className="flex justify-center mb-4">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-4xl font-bold">PayPal</span>
                </div>
              </div>

              {/* PayPal info */}
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Send via PayPal to:</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                  hbg.dream@gmail.com
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mt-1">
                  Nguyen Huy Hung (Hubogo)
                </p>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText('hbg.dream@gmail.com');
                    alert('Email copied!');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Copy PayPal Email
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center">
                  💡 Any amount is appreciated! Leave a message: <span className="font-medium text-blue-600 dark:text-blue-400">"Coffee for Hubogo"</span>
                </p>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            {t('coffee_thanks')}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 dark:text-gray-500 text-sm">
          <p>{t('made_with')}</p>
          <p className="mt-1">{t('copyright')}</p>
        </div>
      </div>
    </div>
  );
}

export default AboutView;
