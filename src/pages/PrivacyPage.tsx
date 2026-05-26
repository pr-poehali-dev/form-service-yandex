import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "hsl(15,12%,5%)" }}>
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(244,81,30,0.08) 0%, transparent 60%)" }} />

      <div className="max-w-3xl mx-auto relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-foreground/40 hover:text-foreground/70 transition mb-8"
        >
          <Icon name="ArrowLeft" size={14} />
          Назад
        </button>

        <div className="rounded-3xl p-8 md:p-12"
          style={{ background: "rgba(12,6,2,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(244,81,30,0.15)" }}>

          <h1 className="text-3xl font-bold text-foreground mb-2">Политика конфиденциальности</h1>
          <p className="text-sm text-muted-foreground mb-8">Последнее обновление: 26 мая 2025 г.</p>

          <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">1. Общие положения</h2>
              <p>Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты персональных данных пользователей сервиса «Формус» (далее — «Сервис»), расположенного по адресу <strong className="text-foreground">forms-dubble.ru</strong>.</p>
              <p className="mt-2">Политика разработана в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных» и является неотъемлемой частью Пользовательского соглашения.</p>
              <p className="mt-2">Используя Сервис, вы выражаете согласие с условиями настоящей Политики. Если вы не согласны с условиями, пожалуйста, прекратите использование Сервиса.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">2. Оператор персональных данных</h2>
              <p>Оператором персональных данных является <strong className="text-foreground">ООО «ДАББЛ РУС»</strong> (далее — «Оператор»).</p>
              <ul className="list-none mt-2 space-y-1 ml-0">
                <li><span className="text-foreground/50">ИНН:</span> 8905069677</li>
                <li><span className="text-foreground/50">КПП:</span> 890501001</li>
                <li><span className="text-foreground/50">ОГРН:</span> 1258900000050</li>
                <li><span className="text-foreground/50">Юридический адрес:</span> 629801, Ямало-Ненецкий автономный округ, г. о. город Ноябрьск, г. Ноябрьск, ул. Магистральная, д. 119, кв. 212</li>
              </ul>
              <p className="mt-2">Контактный адрес для обращений по вопросам обработки персональных данных: <strong className="text-foreground">business.dabblrus@bk.ru</strong></p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">3. Перечень обрабатываемых данных</h2>
              <p className="mb-2">В рамках работы Сервиса Оператор может обрабатывать следующие персональные данные:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Имя и фамилия пользователя</li>
                <li>Адрес электронной почты</li>
                <li>Идентификатор учётной записи Яндекс ID или Даббл ID</li>
                <li>URL аватара профиля</li>
                <li>IP-адрес устройства</li>
                <li>Данные, добавленные пользователем в формы (ответы респондентов)</li>
                <li>Технические данные: тип браузера, операционная система, время посещений</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">4. Цели обработки персональных данных</h2>
              <p className="mb-2">Оператор обрабатывает персональные данные в следующих целях:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Идентификация пользователя и предоставление доступа к Сервису</li>
                <li>Обеспечение работоспособности функций Сервиса (создание форм, сбор ответов)</li>
                <li>Улучшение качества Сервиса и пользовательского опыта</li>
                <li>Направление уведомлений, связанных с использованием Сервиса</li>
                <li>Соблюдение требований законодательства Российской Федерации</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">5. Правовые основания обработки</h2>
              <p>Обработка персональных данных осуществляется на основании:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Согласия субъекта персональных данных (ст. 6, ч. 1, п. 1 ФЗ-152)</li>
                <li>Исполнения договора, стороной которого является субъект (ст. 6, ч. 1, п. 5 ФЗ-152)</li>
                <li>Соблюдения требований законодательства РФ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">6. Передача данных третьим лицам</h2>
              <p>Персональные данные пользователей не передаются третьим лицам, за исключением:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Случаев, предусмотренных законодательством Российской Федерации</li>
                <li>Сервиса Яндекс ID (в рамках OAuth-авторизации) — применяется политика конфиденциальности Яндекса</li>
                <li>Сервиса Даббл ID (в рамках OAuth-авторизации) — применяется политика конфиденциальности Даббл</li>
              </ul>
              <p className="mt-2">Оператор не продаёт персональные данные третьим лицам.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">7. Хранение и защита данных</h2>
              <p>Персональные данные хранятся на серверах, расположенных на территории Российской Федерации, в соответствии с требованиями ст. 18.1 ФЗ-152.</p>
              <p className="mt-2">Оператор принимает необходимые организационные и технические меры для защиты персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения.</p>
              <p className="mt-2">Срок хранения данных: в течение всего периода использования Сервиса + 3 года после удаления аккаунта, если иное не предусмотрено законодательством.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">8. Использование файлов cookie</h2>
              <p>Сервис использует файлы cookie для обеспечения авторизации, сохранения пользовательских настроек и аналитики (Яндекс.Метрика). Вы вправе отказаться от использования cookie через настройки браузера, однако это может повлиять на работоспособность Сервиса.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">9. Права субъектов персональных данных</h2>
              <p className="mb-2">В соответствии с ФЗ-152 вы имеете право:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Получить информацию об обработке ваших персональных данных</li>
                <li>Потребовать уточнения, блокирования или уничтожения персональных данных</li>
                <li>Отозвать согласие на обработку персональных данных</li>
                <li>Обжаловать действия Оператора в Роскомнадзор</li>
              </ul>
              <p className="mt-2">Для реализации прав обратитесь по адресу: <strong className="text-foreground">business.dabblrus@bk.ru</strong></p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">10. Изменение политики</h2>
              <p>Оператор вправе вносить изменения в настоящую Политику. Новая редакция вступает в силу с момента её размещения на сайте. Продолжение использования Сервиса после публикации изменений означает согласие с новой редакцией.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}