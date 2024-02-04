<?php

namespace App\Controller;

use App\Entity\PostIt;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\Extension\Core\Type\SearchType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends AbstractController
{
    
    #[Route('/', name: 'app_home')]
    public function index(EntityManagerInterface $entityManager, Request $request): Response
    {
        $repository = $entityManager->getRepository(Postit::class);
        $postits = $repository->findBy([], ['deadline' => 'ASC']);

        $columns = [
            ['id' => 'a', 'etat' => 'a_faire', 'color' => 'yellow', 'title' => 'À faire'],
            ['id' => 'b', 'etat' => 'en_cours', 'color' => 'blue', 'title' => 'En cours'],
            ['id' => 'c', 'etat' => 'ikos', 'color' => 'blue', 'title' => 'Profil ikos en cours'],
            ['id' => 'd', 'etat' => 'pret', 'color' => 'green', 'title' => 'Prêt']
        ];

        return $this->render('home/index.html.twig', [
            'postits' => $postits,
            'columns' => $columns
        ]);
    }
}
