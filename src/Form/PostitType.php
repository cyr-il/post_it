<?php

namespace App\Form;

use App\Entity\PostIt;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PostitType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('requester', TextType::class,
                [
                    'label' => 'Demandeur'
                ])
            ->add('recipient', TextType::class,
                [
                    'label' => 'Pour'
                ])
            ->add('deadline',DateType::class, [
                'label' => 'Deadline',
            ])
            ->add('ticketNumber', TextType::class,
                [
                    'label' => 'N° Ticket'
                ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => PostIt::class,
        ]);
    }
}
