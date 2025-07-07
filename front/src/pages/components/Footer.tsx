import { Button } from "@/components/ui/button"
import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { Link } from 'react-router-dom';

export default function FooterCompo() {
    return (
        <div className="flex flex-col bg-gray-50">
            {/* Footer */}
            <footer className="bg-blue-900 text-white">
                <div className="container mx-auto px-4 lg:px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Brand Section */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                                    <Heart className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold">Medimate</span>
                                    <span className="text-sm text-blue-300">Healthcare Solutions</span>
                                </div>
                            </div>
                            <p className="text-blue-200 text-sm leading-relaxed">
                                Providing comprehensive healthcare solutions with compassion, innovation, and excellence. Your health is
                                our priority.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Quick Links</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/services" className="text-blue-200 hover:text-white transition-colors text-sm">
                                        Our Services
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/doctors" className="text-blue-200 hover:text-white transition-colors text-sm">
                                        Find a Doctor
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/appointments" className="text-blue-200 hover:text-white transition-colors text-sm">
                                        Book Appointment
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/emergency" className="text-blue-200 hover:text-white transition-colors text-sm">
                                        Emergency Care
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/patient-portal" className="text-blue-200 hover:text-white transition-colors text-sm">
                                        Patient Portal
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Contact Info</h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Phone className="h-4 w-4 text-blue-300" />
                                    <span className="text-blue-200 text-sm">+212 632773027</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Mail className="h-4 w-4 text-blue-300" />
                                    <span className="text-blue-200 text-sm">contact@medimate.com</span>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <MapPin className="h-4 w-4 text-blue-300 mt-0.5" />
                                    <span className="text-blue-200 text-sm">
                    Casablanca Place financier
                    <br />
                    Medical District, MD 12345
                  </span>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Bottom Section */}
                    <div className="border-t border-blue-800 mt-8 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <div className="text-blue-200 text-sm">
                                © {new Date().getFullYear()} Medimate Healthcare Solutions. All rights reserved.
                            </div>

                            {/* Social Links */}
                            <div className="flex items-center space-x-4">
                                <Link href="#" className="text-blue-300 hover:text-white transition-colors">
                                    <Facebook className="h-5 w-5" />
                                </Link>
                                <Link href="#" className="text-blue-300 hover:text-white transition-colors">
                                    <Twitter className="h-5 w-5" />
                                </Link>
                                <Link href="#" className="text-blue-300 hover:text-white transition-colors">
                                    <Instagram className="h-5 w-5" />
                                </Link>
                                <Link href="#" className="text-blue-300 hover:text-white transition-colors">
                                    <Linkedin className="h-5 w-5" />
                                </Link>
                            </div>

                            {/* Legal Links */}
                            <div className="flex items-center space-x-4 text-sm">
                                <Link href="/privacy" className="text-blue-200 hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                                <Link href="/terms" className="text-blue-200 hover:text-white transition-colors">
                                    Terms of Service
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
