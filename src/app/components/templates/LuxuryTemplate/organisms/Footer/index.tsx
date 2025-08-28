// components/templates/LuxuryTemplate/organisms/Footer/index.tsx
import { Crown, Shield, Trophy, Mail, Phone, MapPin } from 'lucide-react';

interface LuxuryFooterProps {
    tenantConfig: any;
}

export const LuxuryFooter: React.FC<LuxuryFooterProps> = ({ tenantConfig }) => {
    return (
        <footer className="bg-gradient-to-br from-gray-900 to-black text-white py-20 px-6">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div>
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center">
                                <Crown className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h4 className="text-3xl font-bold">{tenantConfig.name}</h4>
                                <p className="text-amber-400 font-medium uppercase tracking-widest text-sm">Premium Luxury Raffles</p>
                            </div>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-6">
                            La plataforma de rifas de lujo más exclusiva y confiable del mundo.
                            Productos auténticos, sorteos transparentes, sueños cumplidos desde 2019.
                        </p>
                        <div className="flex space-x-4">
                            <div className="bg-amber-600/20 p-3 rounded-xl">
                                <Shield className="w-6 h-6 text-amber-400" />
                            </div>
                            <div className="bg-amber-600/20 p-3 rounded-xl">
                                <Trophy className="w-6 h-6 text-amber-400" />
                            </div>
                            <div className="bg-amber-600/20 p-3 rounded-xl">
                                <Crown className="w-6 h-6 text-amber-400" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h5 className="text-xl font-bold mb-6 text-amber-300">Colección Premium</h5>
                        <ul className="space-y-3 text-gray-300">
                            <li><a href="#" className="hover:text-amber-300 transition-colors flex items-center space-x-2">
                                <span>⌚</span><span>Relojes de Lujo</span>
                            </a></li>
                            <li><a href="#" className="hover:text-amber-300 transition-colors flex items-center space-x-2">
                                <span>💎</span><span>Joyería Exclusiva</span>
                            </a></li>
                            <li><a href="#" className="hover:text-amber-300 transition-colors flex items-center space-x-2">
                                <span>👜</span><span>Bolsos de Diseñador</span>
                            </a></li>
                            <li><a href="#" className="hover:text-amber-300 transition-colors flex items-center space-x-2">
                                <span>👑</span><span>Accesorios Premium</span>
                            </a></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="text-xl font-bold mb-6 text-amber-300">Servicios VIP</h5>
                        <ul className="space-y-3 text-gray-300">
                            <li><a href="#" className="hover:text-amber-300 transition-colors">Sorteos en Vivo</a></li>
                            <li><a href="#" className="hover:text-amber-300 transition-colors">Certificados de Autenticidad</a></li>
                            <li><a href="#" className="hover:text-amber-300 transition-colors">Entrega Personalizada</a></li>
                            <li><a href="#" className="hover:text-amber-300 transition-colors">Seguro Premium</a></li>
                            <li><a href="#" className="hover:text-amber-300 transition-colors">Soporte 24/7</a></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="text-xl font-bold mb-6 text-amber-300">Contacto Exclusivo</h5>
                        <div className="space-y-4 text-gray-300">
                            <div className="flex items-center space-x-3 bg-amber-600/10 p-4 rounded-xl">
                                <Mail className="w-6 h-6 text-amber-400" />
                                <div>
                                    <p className="font-semibold">Email VIP</p>
                                    <p className="text-sm">{tenantConfig.contact?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 bg-amber-600/10 p-4 rounded-xl">
                                <Phone className="w-6 h-6 text-amber-400" />
                                <div>
                                    <p className="font-semibold">Línea Premium</p>
                                    <p className="text-sm">{tenantConfig.contact?.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 bg-amber-600/10 p-4 rounded-xl">
                                <MapPin className="w-6 h-6 text-amber-400" />
                                <div>
                                    <p className="font-semibold">Showroom</p>
                                    <p className="text-sm">{tenantConfig.contact?.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-amber-600/30 mt-16 pt-12">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                        <div className="text-center md:text-left">
                            <p className="text-gray-300 text-lg">&copy; 2024 {tenantConfig.name}. Todos los derechos reservados.</p>
                            <p className="mt-2 text-sm text-amber-400">
                                Rolex®, Cartier®, Hermès® son marcas registradas de sus respectivos propietarios.
                            </p>
                        </div>

                        <div className="flex space-x-6">
                            <div className="text-center bg-amber-600/20 px-6 py-4 rounded-2xl">
                                <div className="text-2xl font-bold text-amber-300">A+</div>
                                <div className="text-xs text-gray-400">Calificación BBB</div>
                            </div>
                            <div className="text-center bg-amber-600/20 px-6 py-4 rounded-2xl">
                                <div className="text-2xl font-bold text-amber-300">SSL</div>
                                <div className="text-xs text-gray-400">Seguridad</div>
                            </div>
                            <div className="text-center bg-amber-600/20 px-6 py-4 rounded-2xl">
                                <div className="text-2xl font-bold text-amber-300">24/7</div>
                                <div className="text-xs text-gray-400">Soporte VIP</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};